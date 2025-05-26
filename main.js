const { InstanceBase, Regex, runEntrypoint, InstanceStatus, combineRgb } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const { EventSource } = require('eventsource');

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config;
        this.state = {};

        this.updateStatus(InstanceStatus.Connecting);

        let didInitOK = false;

        try {
            await this.fetchLatestState();
            await this.setupEventHub();
            this.updatePresets();
            didInitOK = true;
        } catch(ex) {
            console.error("Error on startup - ", ex);
            didInitOK = false;
        }

        if(didInitOK) {
            this.updateStatus(InstanceStatus.Ok)
            this.updateActions() // export actions
            this.updateFeedbacks() // export feedbacks
            this.updateVariableDefinitions() // export variable definitions
        } else {
            this.updateStatus(InstanceStatus.ConnectionFailure);
        }

	}

    onEventBusOpen(e) {
        this.updateStatus(InstanceStatus.Ok)
    }

    onEventBusError(e) {
        this.updateStatus(InstanceStatus.ConnectionFailure)
        console.error(e);
    }

    async setupEventHub() {

        
        let hub = new EventSource(`http://${this.config.host}:${this.config.port}/eventbus`);
        hub.onerror = (e) => this.onEventBusError(e);
        hub.onopen = (e) => this.onEventBusOpen(e);                
        hub.addEventListener("RouteChange", () => this.fetchStateAndUpdateFeedback());
        hub.addEventListener('NewNdiSource', () =>  this.fetchStateAndUpdateFeedback());
        hub.addEventListener('RouteAdded', () => this.fetchStateAndUpdateFeedback());
        hub.addEventListener('RouteDeleted', () => this.fetchStateAndUpdateFeedback());
        hub.addEventListener('RouteRenamed', () => this.fetchStateAndUpdateFeedback());
        hub.addEventListener('RouteLockStateChange', () => this.fetchStateAndUpdateFeedback());
        hub.addEventListener('Reset', () => this.fetchStateAndUpdateFeedback());
        this.hub = hub;

    }

    async handleNdiSourceDiscovered(e) {
        await this.fetchStateAndUpdateFeedback();
        this.updatePresets();
    }

    async fetchStateAndUpdateFeedback(e) {
        try {
            await this.fetchLatestState();
            console.log("Got latest state. Now update feedback.");
            this.updateVariableDefinitions();
            this.checkFeedbacks();
        } catch(ex) {
            console.error("Exception: ", ex);
        }
    }

    async fetchLatestState() {
        this.log("info", this.config.host);
        this.state.sources = await this.get('sources');
        this.state.slots = await this.get('slots');
    }

    async get(route) {
        let resultRaw = await fetch(`http://${this.config.host}:${this.config.port}/${route}`);
        let result = resultRaw.json();

        return result;
    }

    async put(route) {
        let resultRaw = await fetch(`http://${this.config.host}:${this.config.port}/${route}`, {
            method: 'put'
        });
        let result = resultRaw.json();

        return result;
    }

	// When module gets deleted
	async destroy() {
        if(this.hub) {
            try {
                this.hub.onerror = null;
                this.hub.onopen = null;                
                this.hub.close();
                this.hub = null;
            } catch {

            }
        }

		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config;
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
                default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
                default: '8902',
				width: 4,
				regex: Regex.PORT,
			},
		]
	}

    updatePresets() {
        let presets = [];

        if(this.state && this.state.sources) {
            try {
                this.state.slots.forEach((slot) => {

                    let toAdd = {
                        type: 'button',
                        category: 'Slot Assignments',
                        name: slot.slotName,
                        style: {
                            text: slot.slotName,
                            size: 'auto',
                            color: combineRgb(255, 255, 255),
                            bgcolor: combineRgb(0,0,0)
                        },
                        steps: [
                            {
                                down: [{
                                    actionId: 'set_slot_output',
                                    options: {
                                        slot: slot.code,
                                        sourcedd: '',
                                    }
                                }],
                                up: [],
                            }
                        ],
                        feedbacks: [{
                            feedbackId: "SlotSource",
                            options: {
                                slot: slot.code,
                                sourcedd: '',
                                sourcename: '',
                            },
                            style: {
                                color: combineRgb(255, 255, 255),
                                bgcolor: combineRgb(160, 0, 0)
                            }
                        }]
                    };

                    presets.push(toAdd);

                    toAdd = {
                        type: 'button',
                        category: 'Slot Locking',
                        name: slot.slotName,
                        style: {
                            text: slot.slotName,
                            size: 'auto',
                            color: combineRgb(255, 255, 255),
                            bgcolor: combineRgb(0,0,0)
                        },
                        steps: [
                            {
                                down: [{
                                    actionId: 'lock_slot',
                                    options: {
                                        slot: slot.code
                                    }
                                }],
                                up: [],
                            }
                        ],
                        feedbacks: [{
                            feedbackId: "LockedSlot",
                            options: {
                                slot: slot.code
                            },
                            style: {
                                color: combineRgb(0, 0, 0),
                                bgcolor: combineRgb(160, 160, 0)
                            }
                        }]
                    };
                    

                    presets.push(toAdd);

                    toAdd = {
                        type: 'button',
                        category: 'Slot Unlocking',
                        name: slot.slotName,
                        style: {
                            text: slot.slotName,
                            size: 'auto',
                            color: combineRgb(255, 255, 255),
                            bgcolor: combineRgb(0,0,0)
                        },
                        steps: [
                            {
                                down: [{
                                    actionId: 'unlock_slot',
                                    options: {
                                        slot: slot.code
                                    }
                                }],
                                up: [],
                            }
                        ],
                        feedbacks: []
                    };
                    

                    presets.push(toAdd);
                });


                this.state.sources.forEach((source) => {

                    let toAdd = {
                        type: 'button',
                        category: 'Source Assignments',
                        name: source.name,
                        style: {
                            text: source.name,
                            size: 'auto',
                            color: combineRgb(255, 255, 255),
                            bgcolor: combineRgb(0,0,0)
                        },
                        steps: [
                            {
                                down: [{
                                    actionId: 'set_slot_output',
                                    options: {
                                        slot: '',
                                        sourcedd: source.name,
                                    }
                                }],
                                up: [],
                            }
                        ],
                        feedbacks: [{
                            feedbackId: "SlotSource",
                            options: {
                                sourcedd: '',
                                slot: '',
                                sourcename: source.name
                            },
                            style: {
                                color: combineRgb(255, 255, 255),
                                bgcolor: combineRgb(160, 0, 0)
                            }
                        }]
                    };

                    presets.push(toAdd);
                });                

    

            } catch(ex) {
                console.error("Error when attempting to create the presets.", ex)
            }
    
        }

        this.setPresetDefinitions(presets);
    }

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
