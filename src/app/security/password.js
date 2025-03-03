import bcrypt from 'bcrypt';

export async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error(error);
    }
}

export async function comparePassword(password, hashPassword) {
    try {
        return await bcrypt.compare(password, hashPassword);
    } catch (error) {
        console.error(error);
    }
}
