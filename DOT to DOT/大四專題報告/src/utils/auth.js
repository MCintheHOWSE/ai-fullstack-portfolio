// Auth utility functions
export const isAdmin = (user) => {
    if (!user) return false;
    return user.role === 'admin' ||
        user.is_admin === true ||
        user.email === 'admin@scu.edu.tw';
};

export const getUserFromStorage = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
