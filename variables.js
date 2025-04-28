module.exports = async function (self) {

    let allVariables = [...self.state.slots.map(o => ({
        variableId: `slot_${o.code}_locked`,
        name: `Slot ${o.slotName} Lock Status`
    })), ...self.state.slots.map(o => ({
        variableId: `slot_${o.code}`,
        name: `Slot ${o.slotName} Source`
    }))]

	self.setVariableDefinitions(allVariables);

    let values = {};


    for(let i = 0; i < self.state.slots.length; i++) {
        let o = self.state.slots[i];

        values[`slot_${o.code}`] = o.sourceName;
        values[`slot_${o.code}_locked`] = o.isLocked;
    }

    self.setVariableValues(values);

        
        
        
    //     [
	// 	{ variableId: 'variable1', name: 'My first variable' },
	// 	{ variableId: 'variable2', name: 'My second variable' },
	// 	{ variableId: 'variable3', name: 'Another variable' },
	// ])
}
