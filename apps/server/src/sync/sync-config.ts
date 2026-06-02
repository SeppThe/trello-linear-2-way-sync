import type { LinearPriority } from "@/types/types";

export type SyncConfig = {
	priorityTokens: Record<string, LinearPriority>;
	priorityListNames: Record<string, LinearPriority>;
	statusListNames: Record<string, string>;
	linearStateListNames: Record<string, string>;
};

export const defaultSyncConfig: SyncConfig = {
	priorityTokens: {
		"no priority": "No Priority",
		none: "No Priority",
		urgent: "Urgent",
		p0: "Urgent",
		"prio 0": "Urgent",
		"prio-0": "Urgent",
		"priority 0": "Urgent",
		high: "High",
		p1: "High",
		"prio 1": "High",
		"prio-1": "High",
		"priority 1": "High",
		medium: "Medium",
		p2: "Medium",
		"prio 2": "Medium",
		"prio-2": "Medium",
		"priority 2": "Medium",
		low: "Low",
		p3: "Low",
		"prio 3": "Low",
		"prio-3": "Low",
		"priority 3": "Low",
	},
	priorityListNames: {
		"todo prio 1": "Urgent",
		"todo prio 2": "High",
		"todo prio 3": "Medium",
	},
	statusListNames: {
		wishes: "Backlog",
		buglist: "Backlog",
		todo: "Todo",
		"todo (my boss)": "Todo",
		"todo prio 1": "Todo",
		"todo prio 2": "Todo",
		"todo prio 3": "Todo",
		"in progress": "In Progress",
		done: "Done",
	},
	linearStateListNames: {
		backlog: "Wishes",
		todo: "ToDo",
		"in progress": "In Progress",
		done: "Done",
	},
};
