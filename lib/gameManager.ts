/*
gameManager should:

1. Extract info from user message and previous AI response
2. Calls its own subManagers (such as partyManagers, storyManagers, inventoryManagers, however, for now just placeholders will do) based on extracted data.
3. Update the gameState based on the results of the subManagers.
4. Based on the updates provide additional relevant instructions to the narrator, and the updated gameState to the API.
5. 

I also think that if gameState is new Game State provide new game narrator instructions.

Basis of gameManager is an @ai/openai-sdk agent that managers


*/