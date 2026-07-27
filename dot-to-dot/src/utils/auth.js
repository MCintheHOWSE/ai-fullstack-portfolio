// Auth utility functions
export const isAdmin = (user) => {
    if (!user) return false;
    return user.role === 'admin' ||
        user.is_admin === true ||
        user.email === 'admin@scu.edu.tw';
};

export const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};
