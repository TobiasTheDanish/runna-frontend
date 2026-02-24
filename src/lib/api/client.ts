import { env } from "$env/dynamic/private";
const API_BASE = env.VITE_API_BASE_URL;

export type Session = {
	id?: string;
	date: string;
	distance: number;
	duration: number; // seconds
	notes?: string;
	strava_activity_id?: number;
	source?: 'manual' | 'strava';
	created_at?: string;
	updated_at?: string;
};

export type Goal = {
	id?: number;
	target_distance: number;
	start_date: string;
	end_date: string;
	created_at?: string;
	updated_at?: string;
};

export type GoalProgress = Goal & {
	current_distance: number;
	progress_percentage: number;
	status: 'On Track' | 'Behind' | 'Ahead' | 'Completed';
	expected_distance: number;
	sessions?: Session[];
};

export async function createSession(data: Session): Promise<Session> {
	const res = await fetch(`${API_BASE}/sessions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to create session');
	}

	return res.json();
}

export async function getSessions(startDate?: string, endDate?: string): Promise<Session[]> {
	const params = new URLSearchParams();
	if (startDate) params.append('start_date', startDate);
	if (endDate) params.append('end_date', endDate);

	const res = await fetch(`${API_BASE}/sessions?${params.toString()}`);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to fetch sessions');
	}

	return res.json();
}

export async function getSession(id: string): Promise<Session> {
	const res = await fetch(`${API_BASE}/sessions/${id}`);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to fetch session');
	}

	return res.json();
}

export async function updateSession(id: string, data: Session): Promise<Session> {
	const res = await fetch(`${API_BASE}/sessions/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to update session');
	}

	return res.json();
}

export async function createGoal(data: Partial<Goal>): Promise<Goal> {
	const res = await fetch(`${API_BASE}/goals`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to create goal');
	}

	return res.json();
}

export async function getGoals(): Promise<GoalProgress[]> {
	const res = await fetch(`${API_BASE}/goals`);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to fetch goals');
	}

	return res.json();
}

export async function getGoal(id: string): Promise<GoalProgress> {
	const res = await fetch(`${API_BASE}/goals/${id}`);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to fetch goal');
	}

	return res.json();
}

export async function deleteGoal(id: number): Promise<void> {
	const res = await fetch(`${API_BASE}/goals/${id}`, {
		method: 'DELETE'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to delete goal');
	}
}

// Strava API types and functions

export type StravaConnectionStatus = {
	connected: boolean;
	strava_athlete_id?: number;
	connected_at?: string;
	last_sync?: string;
};

export async function getStravaStatus(): Promise<StravaConnectionStatus> {
	const res = await fetch(`${API_BASE}/strava/status`);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to fetch Strava status');
	}

	return res.json();
}

export async function connectStrava(code: string): Promise<{ success: boolean }> {
	const res = await fetch(`${API_BASE}/strava/connect`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ code })
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to connect to Strava');
	}

	return res.json();
}

export async function disconnectStrava(): Promise<{ success: boolean }> {
	const res = await fetch(`${API_BASE}/strava/disconnect`, {
		method: 'DELETE'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || 'Failed to disconnect from Strava');
	}

	return res.json();
}
