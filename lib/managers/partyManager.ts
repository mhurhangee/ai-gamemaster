export async function partyManager(extractedInfo: any, previousPartyState: any): Promise<any> {
  //placeholder
  return {
    ...previousPartyState,
    changes: [...(previousPartyState.changes || []), ...extractedInfo.changes],
    members: [
      ...(previousPartyState.members || []),
      ...extractedInfo.newMembers
    ].filter(member => !extractedInfo.removedMembers.includes(member))
  }
}