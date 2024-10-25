export async function inventoryManager(extractedInfo: any, previousInventoryState: any): Promise<any> {
  //placeholder
  const updatedItems = [...(previousInventoryState.items || []), ...extractedInfo.addedItems]
    .filter(item => !extractedInfo.removedItems.includes(item) && !extractedInfo.usedItems.includes(item))
  
  return {
    ...previousInventoryState,
    items: updatedItems,
    usedItems: [...(previousInventoryState.usedItems || []), ...extractedInfo.usedItems]
  }
}