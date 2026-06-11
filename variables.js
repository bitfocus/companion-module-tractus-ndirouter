module.exports = async function (self) {
    const slots = self.state.slots || [];
    const sources = self.state.sources || [];
    const machineName = self.state.machineName || {};

    let allVariables = [
    {
        variableId: 'router_connection_online',
        name: 'Router Connection Online'
    },
    {
        variableId: 'source_count',
        name: 'Source Count'
    },
    {
        variableId: 'router_machine_name',
        name: 'Router Machine Name'
    },
    {
        variableId: 'router_machine_real_name',
        name: 'Router Real Machine Name'
    },
    {
        variableId: 'router_machine_override_name',
        name: 'Router Machine Name Override'
    },
    ...slots.map(o => ({
        variableId: `slot_${o.code}_locked`,
        name: `Slot ${o.slotName} Lock Status`
    })), ...slots.map(o => ({
        variableId: `slot_${o.code}`,
        name: `Slot ${o.slotName} Source`
    }))]
    

	self.setVariableDefinitions(allVariables);

    let values = {};

    values.router_connection_online = self.state.connectionOk === true ? 'Online' : 'Offline';
    values.source_count = sources.length;
    values.router_machine_real_name = machineName.real || '';
    values.router_machine_override_name = machineName.override || '';
    values.router_machine_name = machineName.override || machineName.real || '';

    for(let i = 0; i < slots.length; i++) {
        let o = slots[i];

        values[`slot_${o.code}`] = o.sourceName || '';
        values[`slot_${o.code}_locked`] = o.isLocked ? 'Locked' : 'Unlocked';
    }

    self.setVariableValues(values);

        
        
        
    //     [
	// 	{ variableId: 'variable1', name: 'My first variable' },
	// 	{ variableId: 'variable2', name: 'My second variable' },
	// 	{ variableId: 'variable3', name: 'Another variable' },
	// ])
}
