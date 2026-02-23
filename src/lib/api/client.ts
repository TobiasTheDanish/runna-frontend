const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export type Session = {
	id?: string;
	date: string;
	distance: number;
	duration: number; // seconds
	notes?: string;
	created_at?: string;
	updated_at?: string;
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
