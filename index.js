const axios = require('axios');
const cors = require('cors');

const express = require('express');

const server = express();

const config = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
        'X-Riot-Token': 'RGAPI-f4b506fe-5c39-42df-b2f4-fe118d0021ab',
        'Access-Control-Allow-Credentials': true
    }
};

server.use(cors());

server.get('/:id', (req, res) => {
    const { id } = req.params;

    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${id}`, config)
        .then(summoner => {
            axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.data.puuid}/ids?start=0&count=15`, config)
                .then(matchIdsArray => {
                    let matchesArray = [];
                    let promises = [];

                    for (let i = 0; i < matchIdsArray.data.length; i++) {
                        promises.push(
                            axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchIdsArray.data[i]}`, config)
                                .then(match => matchesArray.push(match.data))
                        );
                    };

                    Promise.all(promises)
                        .then(() => res.status(200).json({ summoner: summoner.data, matches: matchesArray }))
                        .catch(err => console.log(err));
                })
                .catch(err => {
                    res.status(500).json({message: "it dont work"});
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

server.listen(process.env.PORT || 8000, () => console.log("Server listening on port 8000..."));