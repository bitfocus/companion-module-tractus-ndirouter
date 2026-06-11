module.exports = function (self) {
    const slots = self.state.slots || [];
    const sources = self.state.sources || [];
    const slotChoices = [{ id: '', label: '(Use Custom Slot Code)' }, ...slots.map(o => ({
        id: o.code,
        label: `${o.slotName} (${o.code})`
    }))];
    const sourceChoices = [{ id: '', label: '(Use Custom Source Name)' }, ...sources.map(o => ({
        id: o.name,
        label: `${o.name}`
    }))];

    const parseOptionText = async (context, value) => {
        const text = String(value || '');
        if(!text || !context?.parseVariablesInString) {
            return text.trim();
        }

        return String(await context.parseVariablesInString(text)).trim();
    };

    const getSlotCode = async (event, context) => {
        return event.options.slot || await parseOptionText(context, event.options.slotCode);
    };

    const getSourceName = async (event, context) => {
        return event.options.sourcedd || await parseOptionText(context, event.options.source);
    };

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
                    choices: sourceChoices
                },
				{
					id: 'source',
					type: 'textinput',
					label: 'Custom NDI Source Name',
					default: "",
                    useVariables: { local: true },
				},
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Router Slot',
                    default: '',
                    choices: slotChoices
                },
                {
                    id: 'slotCode',
                    type: 'textinput',
                    label: 'Custom Router Slot Code',
                    default: '',
                    useVariables: { local: true },
                },
			],
			callback: async (event, context) => {
                const slot = await getSlotCode(event, context);
                const src = await getSourceName(event, context);

                if(!slot || !src) {
                    return;
                }

                await self.put(`slots/${encodeURIComponent(slot)}/set/${encodeURIComponent(src)}`);
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
                    choices: slotChoices
                },
                {
                    id: 'slotCode',
                    type: 'textinput',
                    label: 'Custom Router Slot Code',
                    default: '',
                    useVariables: { local: true },
                },
			],
			callback: async (event, context) => {
                const slot = await getSlotCode(event, context);

                if(!slot) {
                    return;
                }

                await self.put(`slots/lock/${encodeURIComponent(slot)}`);
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
                    choices: slotChoices
                },
                {
                    id: 'slotCode',
                    type: 'textinput',
                    label: 'Custom Router Slot Code',
                    default: '',
                    useVariables: { local: true },
                },
			],
			callback: async (event, context) => {
                const slot = await getSlotCode(event, context);

                if(!slot) {
                    return;
                }

                await self.put(`slots/unlock/${encodeURIComponent(slot)}`);
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
                    choices: slotChoices
                },
                {
                    id: 'slotCode',
                    type: 'textinput',
                    label: 'Custom Router Slot Code',
                    default: '',
                    useVariables: { local: true },
                },
			],
			callback: async (event, context) => {
                const slot = await getSlotCode(event, context);

                if(!slot) {
                    return;
                }

                await self.put(`slots/${encodeURIComponent(slot)}/clear`);
                await self.fetchStateAndUpdateFeedback();
			},            
        },
	})
}
