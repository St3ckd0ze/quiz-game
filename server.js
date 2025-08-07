const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 80;

app.use(express.static ('public'));

app.listen(PORT, () => {
    console.log(`Server gestartet auf Port: http://localhost:${PORT}`);
});

/**
 * The User List managed as an in-memory list
 */
const userList = new Map()
userList.set("Team Rot", { "userID": "Team Rot", "points": 0, "color": "#ff4d4d" });
userList.set("Team Grün", { "userID": "Team Grün", "points": 0, "color": "#4dff4d" });
userList.set("Team Blau", { "userID": "Team Blau", "points": 0, "color": "#4d4dff" });
userList.set("Team Orange", { "userID": "Team Orange", "points": 0, "color": "#ffb84d" });

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "Authorization");
    next();
});

app.get('/api/login', function (req, res, next) {

    if (typeof req.headers.authorization !== "undefined") {

        var authenticationString = req.headers.authorization;
        let base64String = authenticationString.split(" ")[1];
        var credentials = atob(base64String);
        const userID = credentials.split(":")[0];
        const password = credentials.split(":")[1];

        console.log("Want to login user: " + userID + " Password: " + password)

        if (userID && password) {

            let userObject = userList.get(userID);
            if (userObject) {
                if (password === userObject.password) {
                    console.log("Login success")
                    let result = { 'userID': userID };

                    if (userObject.firstName) {
                        result.firstName = userObject.firstName;
                    }
                    if (userObject.lastName) {
                        result.lastName = userObject.lastName;
                    }

                    res.status(200).send(result);
                }
                else {
                    console.error("Invalid password")
                    res.status(401).send({ 'Error': 'Invalid login data' });
                }
            }
            else {
                console.error("User does not exist")
                res.status(401).send({ 'Error': 'Invalid login data' });
            }
        }
        else {
            console.error("Data missing")
            res.status(401).send({ 'Error': 'Invalid login data' });
        }
    }
});

app.post('/api/users', function (req, res, next) {

    let userObject = req.body;
    if (userObject) {

        console.log("Got Body: " + JSON.stringify(req.body))
        let userID = req.body.userID;
        let password = req.body.password;
        if (userID && password) {

            if (userList.get(userID)) {
                res.status(400).send({ 'Error': 'User already exits' })
                return;
            }

            userList.set(userID, userObject);
            res.status(200).send({ 'Info': 'Added user ' + userID, 'Count': 'Have ' + userList.size + ' users' });

        }
        else {
            res.status(400).send({ 'Error': 'Incomplete data in body' })
        }
    }
    else {
        res.status(400).send({ 'Error': 'Body is missing' })
    }
});

app.get('/api/users', function (req, res, next) {
    let userArray = Array.from(userList.entries()).map(([name, value]) => {
        return value;
    });
    res.status(200).send(userArray);
});

app.get('/api/users/count', function (req, res, next) {
    res.status(200).send({ 'UserCount': userList.size });
});

// Update an existing user
app.get('/api/users/:id', (req, res) => {
    const userID = req.params.id;
    const user = userList.get(userID);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

// Update an existing user
app.put('/api/users/:id', (req, res) => {
    const userID = req.params.id;
    const updatedUser = req.body;
    let currentUser = userList.get(userID);
    if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    else {
        if (!updatedUser.userID || !updatedUser.password) {
            return res.status(400).json({ message: 'UserID and password are required' });
        }
        console.log("Update user: " + userID + " with: " + JSON.stringify(updatedUser))
        Object.assign(currentUser, updatedUser);
        userList.set(userID, currentUser);
        console.log("Updated user: " + userID + " with: " + JSON.stringify(currentUser))
        res.status(200).json(currentUser);
    }
});

app.delete('/api/users/:id', (req, res) => {

    const userId = req.params.id;

    console.log("Want to delete: " + userId)

    let userObject = userList.get(userId);

    if (userObject) {
        userList.delete(userId);
        res.status(204).send(); // 204 No Content on successful delete
    }
    else {
        return res.status(404).json({ message: 'User not found' });
    }
});

// ------------------------------------------------------------
// QUIZ GAME TEAM ROUTES
// ------------------------------------------------------------

// GET all teams and their points for navbar + overlay dropdowns
app.get('/teams', (req, res) => {
    const teams = Array.from(userList.entries()).map(([name, data]) => ({
        name,
        points: data.points || 0,
        color: data.color || "#ffffff"
    }));
    res.json(teams);
});

// Map, um pro Frage zu speichern, welche Teams schon geantwortet haben
const answeredTeamsPerQuestion = new Map();
// Map, um pro Frage zu speichern, welches Team die Frage ausgewählt hat (erstes Team)
const questionSelectorPerQuestion = new Map();

app.post('/teams/update', (req, res) => {
  const { teamName, isCorrect, fieldPoints, steal, victimTeam, frageId, isQuestionSelector } = req.body;

  if (!userList.has(teamName)) {
    return res.status(400).json({ error: "Team nicht gefunden" });
  }

  if (!frageId) {
    return res.status(400).json({ error: "Frage-ID fehlt" });
  }

  let team = userList.get(teamName);

  // Hole oder erstelle Set mit Teams, die für diese Frage geantwortet haben
  let answeredTeams = answeredTeamsPerQuestion.get(frageId);
  if (!answeredTeams) {
    answeredTeams = new Set();
    answeredTeamsPerQuestion.set(frageId, answeredTeams);
  }

  // Wenn das Team die Frage ausgewählt hat, speichere es als Question Selector
  if (isQuestionSelector) {
    questionSelectorPerQuestion.set(frageId, teamName);
  }

  // Hole das Team, das die Frage ausgewählt hat
  const questionSelector = questionSelectorPerQuestion.get(frageId);
  
  // Prüfe, ob Team schon für diese Frage geantwortet hat
  const firstTry = !answeredTeams.has(teamName);
  
  // Prüfe, ob dieses Team die Frage ausgewählt hat
  const isThisTeamSelector = teamName === questionSelector;

  if (steal && victimTeam && userList.has(victimTeam)) {
    // Stehlen-Logik bleibt gleich
    let victim = userList.get(victimTeam);
    const halfPoints = Math.floor(fieldPoints / 2);
    victim.points -= halfPoints;
    team.points += halfPoints;
    userList.set(victimTeam, victim);
    userList.set(teamName, team);
    return res.json({ message: "Punkte geklaut" });
  }

  if (isCorrect) {
    if (isThisTeamSelector && firstTry) {
      // Frage-Auswähler beim ersten Versuch richtig: 100% der fieldPoints
      team.points += fieldPoints;
    } else {
      // Alle anderen oder Frage-Auswähler bei späteren Versuchen: 50% der fieldPoints
      team.points += Math.floor(fieldPoints / 2);
    }
  } else {
    // Falsche Antwort: immer -50% der fieldPoints
    team.points -= Math.floor(fieldPoints / 2);
  }

  answeredTeams.add(teamName);
  userList.set(teamName, team);

  res.json({ message: "Punkte aktualisiert" });
});