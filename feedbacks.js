const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
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

    const getSlotCode = async (feedback, context) => {
        return feedback.options.slot || await parseOptionText(context, feedback.options.slotCode);
    };

    const getSourceName = async (feedback, context) => {
        return feedback.options.sourcedd || await parseOptionText(context, feedback.options.sourcename);
    };
    
	self.setFeedbackDefinitions({
        RouterConnectionState: {
            name: 'Router Connection Online/Offline',
            type: 'boolean',
            label: 'Router Connection State',
            defaultStyle: {
                bgcolor: combineRgb(0, 120, 0),
                color: combineRgb(255, 255, 255),
            },
            options: [
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    default: 'online',
                    choices: [
                        { id: 'online', label: 'Online' },
                        { id: 'offline', label: 'Offline' },
                    ],
                },
            ],
            callback: (feedback) => {
                const online = self.state.connectionOk === true;
                return feedback.options.state === 'offline' ? !online : online;
            },
        },
		SlotSource: {
			name: 'Source is Assigned to Slot',
			type: 'boolean',
			label: 'Source Assigned to Slot',
			defaultStyle: {
				bgcolor: combineRgb(160, 0, 0),
				color: combineRgb(255, 255, 255),
			},
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
                {
                    id: 'sourcedd',
                    type: 'dropdown',
                    label: 'NDI Source',
                    default: '',
                    choices: sourceChoices
                },
				{
					id: 'sourcename',
					type: 'textinput',
					label: 'Custom NDI Source Name',
					default: '',
                    useVariables: { local: true },
				},
			],
			callback: async (feedback, context) => {
                let slotCode = await getSlotCode(feedback, context);
                let sourceName = await getSourceName(feedback, context);

                if(!slotCode || !sourceName) {
                    return false;
                }

                let slot = self.state.slots.find(x => x.code == slotCode);
                if(!slot) {
                    return false;
                }

                
                return slot.sourceName == sourceName;
			},
		},
        LockedSlot: {
			name: 'Slot is Locked',
			type: 'boolean',
			label: 'Slot is Locked',
			defaultStyle: {
				bgcolor: combineRgb(160, 160, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: async (feedback, context) => {
                let slotCode = await getSlotCode(feedback, context);
                if(!slotCode) {
                    return false;
                }

                let slot = self.state.slots.find(x => x.code == slotCode);
                if(!slot) {
                    return false;
                }

                return slot.isLocked;
			},
		},
	})


}
