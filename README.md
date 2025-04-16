[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MrtJ130o)
#### 1) GET `/pokemon/{id}`
```
- Fetches the relevant Pokémon data given the `{id}` supplied in the request URL param.
- Returns the related data from PokéAPI. Check swagger for the fields/payload example.
- Throws a `400` error if an invalid Pokémon ID or name is given.
```

#### 2) POST `/pokemon/catch`
```
- "Catches" a list of valid Pokémons into our memory/storage.
- Send a list of Pokémon IDs/names as part of the POST request body.
- A caught Pokémon will also have a unique caughtPokemonId generated and attached to its data model.
- If an invalid ID/name is given, do not catch the Pokémon, see swagger for sample response payload.
```

#### 3) GET `/pokemon/{caughtPokemonId}`
```
- Return the Pokémon data of caught Pokémon with the uniquely generated "caughtPokemonId" in the request URL param.
- "caughtPokemonId" is **NOT** the Pokémon ID, but it's a uniquely generated ID by our service 
  - (i.e two identical caught Pokémons have the same id but different caughtPokemonId)
- If invalid caughtPokemonId is given, return an empty object.
```

#### 4) DELETE `/pokemon/{caughtPokemonId}`
```
- Deletes/releases the Pokémon with the given caughtPokemonId. This removes it from our list of caught Pokémons.
- If valid caughtPokemonId is given, return a 200 response and a short message indicating Pokémon was deleted.
- If invalid caughtPokemonId is given, throw a 400 error response.
```

#### 5) POST `/pokemon/teach/{caughtPokemonId}`
```
- Teach moves to your Pokémon with caughtPokemonId.
- Requires an array of 0-4 move ids/names to be passed along as the POST request body.
- A Pokémon may only know 4 moves at any given time. Up to you on which moves to delete to make room for new moves.
- Response payload should have the caughtPokemonId data model with the new "moves" field. See swagger for example.
```

#### 6) PUT `/pokemon/evolve/{caughtPokemonId}`
```
- Evolves your Pokémon with caughtPokemonId.
- Replaces the name & id of the caughtPokemonId with the evolved name & id.
  - (i.e charmander, 4 -> charmeleon, 5)
- If a Pokémon has more than 1 evolution form, up to you to select which form to evolve to.
- If a Pokémon is no longer able to evolve or invalid caughtPokemonId given, return a 400 error.
```

#### 7) POST `/pokemon/breed-check`
```
- Two Pokémon are breedable if they belong to the same egg group.
- For this endpoint, you will accept 2 Pokémon ids/names in the POST request body.
- Look up the necessary data from PokéAPI to determine if these two Pokémon can be bred.
  - *Hint* https://pokeapi.co/docs/v2#egg-groups might be a useful PokéAPI endpoint to use.
- Return True/False as a response.
```

#### 8) GET `/item/buy/{id}`
```
- "Buy" a given item id/name as part of the GET request URL param, and store it in our bag in memory.
- We should store the newly bought item and return the current state of our bag.
- Return 400 error if an invalid item id/name is given.
- Return 500 error if the item is valid but our bag is full. Our bag has a limit of 10 items.
```

#### 9) GET `/bag`
```
- Return the current state of our bag, similar response payload from above when successfully buying an item.
- If no item has been bought yet, the inital state of the bag should be an empty list.
```

#### 10) DELETE `/bag`
```
- Empties out our bag, returns a success message that our bag has been emptied.

