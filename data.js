export const state = {
    people: JSON.parse(localStorage.getItem('qa_people')) || [],
    assignments: JSON.parse(localStorage.getItem('qa_assignments')) || {},
    patchesAssignments: JSON.parse(localStorage.getItem('qa_patchesAssignments')) || {},
    claves: JSON.parse(localStorage.getItem('qa_claves')) || {},
    year: 2026, month: new Date().getMonth(), view: 'month',
    patchesYear: 2026, patchesMonth: new Date().getMonth(), patchesView: 'month',
    currentPage: 'calendar', editPersonId: null, assignKey: null, assignGroup: 1,
    patchesAssignKey: null, patchesAssignGroup: 1, selectedGroup: 1,
    pin: '', pinCallback: null, isAdmin: false
};

export const saveState = () => {
    localStorage.setItem('qa_people', JSON.stringify(state.people));
    localStorage.setItem('qa_assignments', JSON.stringify(state.assignments));
    localStorage.setItem('qa_patchesAssignments', JSON.stringify(state.patchesAssignments));
    localStorage.setItem('qa_claves', JSON.stringify(state.claves));
};

export const ADMIN_PIN = '1234';
export const SESSION_HOURS = 8;
export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
export const ENVS = ['mgqa1', 'mgqa2', 'mgqa3', 'pmgqa1', 'pmgqa2', 'pmgqa3', 'pmgpostqa'];

export const uid = () => Math.random().toString(36).slice(2, 9);
export const initials = (name) => name.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
export const weekGroup = (n) => n % 2 === 1 ? 1 : 2;
export const weekKey = (y, w) => `${y}-W${String(w).padStart(2, '0')}`;
export const countWeeks = (id) => Object.values(state.assignments).filter(v => v === id).length;
export const countPW = (id) => Object.values(state.patchesAssignments).filter(v => v === id).length;

export function getTuesdayWeeks(year) {
    const res = []; let d = new Date(year, 0, 1);
    while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
    let n = 1;
    while (d.getFullYear() === year) {
        res.push({ n, date: new Date(d), grp: weekGroup(n) });
        d.setDate(d.getDate() + 7); n++;
    }
    return res;
}
export function getWeeksForMonth(year, month) {
    return getTuesdayWeeks(year).filter(w => {
        const end = new Date(w.date); end.setDate(w.date.getDate() + 6);
        return end >= new Date(year, month, 1) && w.date <= new Date(year, month + 1, 0);
    });
}
export function getCurrentWeekNum(year) {
    const today = new Date(); const weeks = getTuesdayWeeks(year);
    for (const week of weeks) {
        const start = new Date(week.date); const end = new Date(start); end.setDate(start.getDate() + 6);
        if (today >= start && today <= end) return week.n;
    }
    return weeks.length ? (today < weeks[0].date ? weeks[0].n : weeks[weeks.length - 1].n) : 1;
}

export function getMondayWeeks(year) {
    const res = []; let d = new Date(year, 0, 1);
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    let n = 1;
    while (d.getFullYear() === year) {
        res.push({ n, date: new Date(d), grp: weekGroup(n) });
        d.setDate(d.getDate() + 7); n++;
    }
    return res;
}
export function getPatchWeeksForMonth(year, month) {
    return getMondayWeeks(year).filter(w => {
        const end = new Date(w.date); end.setDate(w.date.getDate() + 6);
        return end >= new Date(year, month, 1) && w.date <= new Date(year, month + 1, 0);
    });
}
export function getCurrentPatchWeekNum(year) {
    const today = new Date(); const weeks = getMondayWeeks(year);
    for (const week of weeks) {
        const start = new Date(week.date); const end = new Date(start); end.setDate(start.getDate() + 6);
        if (today >= start && today <= end) return week.n;
    }
    return weeks.length ? (today < weeks[0].date ? weeks[0].n : weeks[weeks.length - 1].n) : 1;
}
