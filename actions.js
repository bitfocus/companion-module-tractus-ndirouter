module.exports = function (self) {
    const slots = self.state.slots || [];
    const sources = self.state.sources || [];

	self.setActionDefinitions({
        refresh_state: {
            name: 'Refresh Slot/Source List',
            options: [],
            callback: async () => {
                await self.fetchStateAndUpdateFeedback();
            },
        },

		set_slot_output: {
			name: 'Set Slot Source',
			options: [
                {
                    id: 'sourcedd',
                    type: 'dropdown',
                    label: 'NDI Source',
                    default: '',
                    choices: [{id: '', label: '(Use Custom Source Name)'}, ...sources.map(o => ({
                        id: o.name,
                        label: `${o.name}`
                    }))]
                },
				{
					id: 'source',
					type: 'textinput',
					label: 'Custom NDI Source Name',
					default: "",
					min: 0,
					max: 300,
				},
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Router Slot',
                    default: '',
                    choices: slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                }
			],
			callback: async (event) => {
                let src = event.options.sourcedd;
                if(!src) {
                    src = event.options.source;
                }

                if(!event.options.slot || !src) {
                    return;
                }

                await self.put(`slots/${event.options.slot}/set/${encodeURIComponent(src)}`);
                await self.fetchStateAndUpdateFeedback();
			},
		},

		lock_slot: {
			name: 'Lock Slot',
			options: [
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Router Slot',
                    default: '',
                    choices: slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                }
			],
			callback: async (event) => {
                if(!event.options.slot) {
                    return;
                }

                await self.put(`slots/lock/${event.options.slot}`);
                await self.fetchStateAndUpdateFeedback();
			},
		},

		unlock_slot: {
			name: 'Unlock Slot',
			options: [
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Router Slot',
                    default: '',
                    choices: slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                }
			],
			callback: async (event) => {
                if(!event.options.slot) {
                    return;
                }

                await self.put(`slots/unlock/${event.options.slot}`);
                await self.fetchStateAndUpdateFeedback();
			},
		},



        clear_slot_output: {
            name: 'Clear Slot Output',
			options: [
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Router Slot',
                    default: '',
                    choices: slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                }
			],
			callback: async (event) => {
                if(!event.options.slot) {
                    return;
                }

                await self.put(`slots/${event.options.slot}/clear`);
                await self.fetchStateAndUpdateFeedback();
			},            
        },
	})
}
