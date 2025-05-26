const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
    
	self.setFeedbackDefinitions({
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
                    choices: self.state.slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                },
                {
                    id: 'sourcedd',
                    type: 'dropdown',
                    label: 'NDI Source',
                    default: '',
                    choices: [{id: '', label: '(Use Custom Source Name)'}, ...self.state.sources.map(o => ({
                        id: o.name,
                        label: `${o.name}`
                    }))]
                },
				{
					id: 'sourcename',
					type: 'textinput',
					label: 'Custom NDI Source Name',
					default: ''
				},
			],
			callback: (feedback) => {
                console.log(feedback);
				self.log('info', 'Feedback callback!', feedback, feedback.options.sourcedd, feedback.options.sourcename, feedback.options.slot)


                let slotCode = feedback.options.slot;
                let sourceName = feedback.options.sourcedd || feedback.options.sourcename;

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
                    choices: self.state.slots.map(o => ({
                        id: o.code,
                        label: `${o.slotName} (${o.code})`
                    }))
                }
			],
			callback: (feedback) => {
				self.log('info', 'Feedback callback!', feedback,feedback.options.slot)


                let slotCode = feedback.options.slot;
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
