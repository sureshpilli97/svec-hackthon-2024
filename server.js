const database = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to SVEC CAI Hackthon 2024 Server!');
});

app.get('/get_team_members', async (req, res) => {

    const { team_name } = req.query;
    const query = `SELECT * FROM TEAMS WHERE team_name = ?`;

    try {
        const db = await database.connectToDB();
        const [result] = await db.execute(query, [team_name]);
        await db.end();

        if (result.length === 0) {
            res.status(404).send({ message: 'Team not found.' });
        } else {
            if (result[0].is_updated === true) {
                res.status(200).send([]);
            }
            res.status(200).send(result);
        }
    } catch (err) {
        console.error('Failed to Find Team Members:', err);
        res.status(500).send({ error: 'Failed to Find Team Members.' });
    }
});


app.post('/insert_rollno', async (req, res) => {
    const { team } = req.body;
    const updateQuery = `UPDATE TEAMS SET roll_no = ?, is_updated = 1 WHERE candidate_email = ?`;

    try {
        const db = await database.connectToDB();

        for (const member of team) {
            const { roll_no, candidate_email } = member;
            await db.execute(updateQuery, [roll_no, candidate_email]);
        }
        await db.end();

        res.status(201).send({ message: 'candidate details updated successfully!' });
    } catch (err) {
        console.error('Failed to update candidate details:', err);
        res.status(500).send({ error: 'Failed to update candidate details.' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
