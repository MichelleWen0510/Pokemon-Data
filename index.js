import express from 'express';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };

const app = express();
// This allows us to parse JSON data from the request body (if any).
app.use(express.json())

// Swagger config
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;

// *Hint: use this array to store a list of objects of each of the caught Pokémon.
const CAUGHT_POKEMON = [];

const BAG = [];

// *Hint: use uuidv4 to generate a random ID
let uniqueID = uuidv4();

// Root route to get your started + check for PokeAPI connectivity.
app.get('/', async (req, res) => {
  await fetch('https://pokeapi.co/api/v2/')
    .then(() => {
      res.send(`
        <html lang="en-US">
           <h1>PokeAPI Online!</h1>
           <h3>Head on over to <a href="http://localhost:3000/api-docs">/api-docs</a> to get started!</h3>
        </html>
      `);
    })
    .catch((e) => {
      res.send(`
        <html lang="en-US">
           <h1>PokeAPI is down.</h1>
           <h3>Check <a href="https://pokeapi.statuspage.io/">https://pokeapi.statuspage.io/</a> for status updates</h3>
           <div>Error: ${e}</div>
        </html>
      `);
    })
})

/*
* Start implementing the endpoints below!
* */

app.get('/pokemon/:id', (req, res) => {
    const { id } = req.params;
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
            return response.json();
        }).catch(error => {
            res.status(400).send("Invalid Pokémon ID given.");
        })
        .then(data => {
            const statsArray = data.stats;
            const pokemon = {
                    id: data.id,
                    name: data.name,
                    height: data.height,
                    weight: data.weight,
                    stats: {
                        hp: statsArray[0].base_stat,
                        attack: statsArray[1].base_stat,
                        defense: statsArray[2].base_stat,
                        specialAttack: statsArray[3].base_stat,
                        specialDefense: statsArray[4].base_stat,
                        speed: statsArray[5].base_stat
                    }
            }
            res.status(200).send(pokemon);
        })
})


app.post('/pokemon/catch', async (req, res) => {
    const pokemonList = req.body;
    const baseUrl = "https://pokeapi.co/api/v2/pokemon"
    const validPokemons = [];

    for (const pokemon of pokemonList) {
        try {
            const url = `${baseUrl}/${pokemon}`;
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                validPokemons.push(pokemon);
            }
        } catch (error) {
            console.log(`Error getting ${pokemon}: ${error.message}`);
        }
    }

    for (const pokemon of validPokemons) {
        try {
            const url = `${baseUrl}/${pokemon}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const statsArray = data.stats;
                const pokemonInfo = {
                    id: data.id,
                    caughtPokemonId: uuidv4(),
                    name: data.name,
                    moves: [],
                    height: data.height,
                    weight: data.weight,
                    stats: {
                        hp: statsArray[0].base_stat,
                        attack: statsArray[1].base_stat,
                        defense: statsArray[2].base_stat,
                        specialAttack: statsArray[3].base_stat,
                        specialDefense: statsArray[4].base_stat,
                        speed: statsArray[5].base_stat
                    }
                }
                CAUGHT_POKEMON.push(pokemonInfo);
            } else {
                console.log(`Error getting ${pokemon}: ${response.text}`);
            }
        } catch (error) {
            console.log(`Error getting ${pokemon}: ${error.message}`);
        }
    }
    res.send(CAUGHT_POKEMON);
})

app.get('/pokemon/caught/:caughtPokemonId', (req, res) => {
    const { caughtPokemonId } = req.params;
    if (caughtPokemonId === "{caughtPokemonId}") {
        res.send(CAUGHT_POKEMON);
    } else {
        let caughtPokemon = '[]';
        for (const pokemon of CAUGHT_POKEMON) {
            if (caughtPokemonId === pokemon.caughtPokemonId) {
                caughtPokemon = pokemon;
            }
        }
        res.send(caughtPokemon);
    }
})

app.delete('/pokemon/caught/:caughtPokemonId', (req, res) => {
    const { caughtPokemonId } = req.params;
    let positionPokemon = 0;
    let notFound = true;
    for (let i = 0; i < CAUGHT_POKEMON.length; i++) {
        if (caughtPokemonId === CAUGHT_POKEMON[i].caughtPokemonId) {
            positionPokemon = i;
            notFound = false;
        }
    }
    if (notFound) {
        res.status(400).send("Error caughtPokemonId given");
    } else {
        CAUGHT_POKEMON.splice(positionPokemon, 1);
        res.status(200).send(`Successfully deleted Pokémon: ${caughtPokemonId}`);
    }
})

app.post('/pokemon/teach/:caughtPokemonId', async (req, res) => {
    const { caughtPokemonId } = req.params;
    const movesToLearn = req.body;
    const baseUrl = "https://pokeapi.co/api/v2/move"
    const validMoves = [];

    for (const move of movesToLearn) {
        try {
            const url = `${baseUrl}/${move}`;
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                validMoves.push(move);
            }
        } catch (error) {
            console.log(`Error getting ${move}: ${error.message}`);
            res.status(400).send("Unable to teach move");
        }
    }

    let positionPokemon = 0;
    let notFound = true;
    for (let i = 0; i < CAUGHT_POKEMON.length; i++) {
        if (caughtPokemonId === CAUGHT_POKEMON[i].caughtPokemonId) {
            positionPokemon = i;
            notFound = false;
        }
    }
    if (notFound) {
        res.status(400).send("Error caughtPokemonId given");
    } else {
        for (let i = 0; i < validMoves.length; i++) {
            let move = validMoves[i];
            const url = `https://pokeapi.co/api/v2/move/${move}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const move = {
                    id: data.id,
                    name: data.name
                }
                if (CAUGHT_POKEMON[positionPokemon].moves.length + validMoves.length >= 4) {
                    if (CAUGHT_POKEMON[positionPokemon].moves.length <= 3) {
                        CAUGHT_POKEMON[positionPokemon].moves.push(move);
                    } else {
                        CAUGHT_POKEMON[positionPokemon].moves[i%4] = move;
                    }
                } else {
                    CAUGHT_POKEMON[positionPokemon].moves.push(move);
                }
            }
        }
    }
    res.status(200).send(CAUGHT_POKEMON[positionPokemon]);
})

app.put('/pokemon/evolve/:caughtPokemonId', async (req, res) => {
    const { caughtPokemonId } = req.params;

    let positionPokemon = 0;
    let notFound = true;
    for (let i = 0; i < CAUGHT_POKEMON.length; i++) {
        if (caughtPokemonId === CAUGHT_POKEMON[i].caughtPokemonId) {
            positionPokemon = i;
            notFound = false;
        }
    }
    if (notFound) {
        res.status(400).send("Error caughtPokemonId given");
    } else {
        const url1 = `https://pokeapi.co/api/v2/pokemon-species/${CAUGHT_POKEMON[positionPokemon].name}`;
        const response1 = await fetch(url1);
        const data1 = await response1.json();
        const evolutionUrl = data1.evolution_chain.url;

        const response2 = await fetch(evolutionUrl);
        const data2 = await response2.json();
        const evolution = data2.chain.evolves_to;

        if (evolution.length === 0) {
            res.status(400).send("Error caughtPokemonId given");
        } else {
            let name = evolution[0].species.name;
            if (CAUGHT_POKEMON[positionPokemon].name === name
                && evolution[0].evolves_to.length > 0) {
                name = evolution[0].evolves_to[0].species.name;
            } else if (evolution[0].evolves_to[0] !== undefined)
            {
                if (CAUGHT_POKEMON[positionPokemon].name === evolution[0].evolves_to[0].species.name) {
                    name = evolution[0].evolves_to[0].species.name;
                }
            }
            CAUGHT_POKEMON[positionPokemon].name = name;
            const url3 = `https://pokeapi.co/api/v2/pokemon/${CAUGHT_POKEMON[positionPokemon].name}`;
            const response3 = await fetch(url3);
            const data3 = await response3.json();
            const statsArray = data3.stats;
            CAUGHT_POKEMON[positionPokemon].id = data3.id;
            CAUGHT_POKEMON[positionPokemon].height = data3.height;
            CAUGHT_POKEMON[positionPokemon].weight = data3.weight;
            CAUGHT_POKEMON[positionPokemon].stats.hp = statsArray[0].base_stat;
            CAUGHT_POKEMON[positionPokemon].stats.attack = statsArray[1].base_stat;
            CAUGHT_POKEMON[positionPokemon].stats.defense = statsArray[2].base_stat;
            CAUGHT_POKEMON[positionPokemon].stats.specialAttack = statsArray[3].base_stat;
            CAUGHT_POKEMON[positionPokemon].stats.specialDefense = statsArray[4].base_stat;
            CAUGHT_POKEMON[positionPokemon].stats.speed = statsArray[5].base_stat;
        }
    }
    res.status(200).send(CAUGHT_POKEMON[positionPokemon]);
})

app.post('/pokemon/breed-check', async (req, res) => {
    const pokemonList = req.body;
    const validPokemons = [];

    for (const pokemon of pokemonList) {
        try {
            const url = `https://pokeapi.co/api/v2/pokemon-species/${pokemon}`;
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                validPokemons.push(pokemon);
            }
        } catch (error) {
            console.log(`Error getting ${pokemon}: ${error.message}`);
        }
    }

    if (validPokemons.length === 2) {
        const url1 = `https://pokeapi.co/api/v2/pokemon-species/${validPokemons[0]}`;
        const response1 = await fetch(url1);
        const data1 = await response1.json();
        const eggGroup1 = data1.egg_groups;

        const url2 = `https://pokeapi.co/api/v2/pokemon-species/${validPokemons[1]}`;
        const response2 = await fetch(url2);
        const data2 = await response2.json();
        const eggGroup2 = data2.egg_groups;
        

        let breed = false;
        for (let i = 0; i < eggGroup1.length; i++) {
            for (let j = 0; j < eggGroup1.length; j++) {
                if (eggGroup1[i].name === eggGroup2[j].name) {
                    breed = true;
                }
            }
        }
        res.status(200).send(breed);
    } else {
        res.status(400).send("Error Pokémon ID or name given in the request payload.");
    }
})

app.get('/item/buy/:id', async (req, res) => {
    const { id } = req.params;
    const idOk = [];
    if (BAG.length < 10) {
        try {
            const url = `https://pokeapi.co/api/v2/item/${id}`;
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                idOk.push(id);
            }
        } catch (error) {
            console.log(`Error getting ${id}: ${error.message}`);
        }
        if (idOk.length === 1) {
            const url = `https://pokeapi.co/api/v2/item/${idOk[0]}`;
            const response = await fetch(url);
            const data = await response.json();
            const item = {
                id: data.id,
                name: data.name,
                cost: data.cost
            }
            BAG.push(item);
            res.status(200).send(BAG);
        } else {
            res.status(400).send("Error/invalid item id given");
        }
    } else {
        res.status(500).send("Bag is full, unable to store any more items. Limit of 10 items reached.")
    }
})

app.get('/bag', (req, res) => {
    res.send(BAG);
})

app.delete('/bag', (req, res) => {
    while (BAG.length) {
        BAG.pop();
    }
    res.send("Bag emptied!");
})

app.listen(PORT, () => {
  console.log(`ExpressJS server listening on port ${PORT}`);
})