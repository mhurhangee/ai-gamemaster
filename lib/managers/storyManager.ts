export async function storyManager(extractedInfo: any, previousStoryState: any): Promise<any> {
  //placeholder
  return {
    ...previousStoryState,
    progressions: [...(previousStoryState.progressions || []), ...extractedInfo.progressions],
    locations: [...(previousStoryState.locations || []), ...extractedInfo.newLocations],
    completedObjectives: [...(previousStoryState.completedObjectives || []), ...extractedInfo.completedObjectives],
    isNewGame: false
  }
}