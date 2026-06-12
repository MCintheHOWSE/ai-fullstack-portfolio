/**
 * Client-Side Encryption Utilities
 * Zero-Knowledge Payment System
 * 
 * Uses Web Crypto API for AES-GCM encryption
 * Bank account info is encrypted before storing in localStorage
 */

/**
 * Generate encryption key from user session
 * @param {number} userId - User's ID
 * @param {string} sessionToken - User's session token (from login)
 * @returns {Promise<CryptoKey>}
 */
async function generateEncryptionKey(userId, sessionToken) {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(`${userId}-${sessionToken}-scu-dotdot`);

    // Import key material
    const importedKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key
    const salt = encoder.encode('scu-payment-salt'); // Static salt for this app
    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        importedKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Encrypt bank account information
 * @param {string} bankCode - Bank code (e.g., "822")
 * @param {string} accountNumber - Account number
 * @param {number} userId - User's ID
 * @param {string} sessionToken - Session token
 * @returns {Promise<string>} - Base64 encoded encrypted data
 */
export async function encryptBankInfo(bankCode, accountNumber, userId, sessionToken) {
    try {
        const key = await generateEncryptionKey(userId, sessionToken);

        const plaintext = JSON.stringify({
            bankCode,
            accountNumber,
            timestamp: new Date().toISOString()
        });

        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate random IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );

        // Combine IV and ciphertext
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('無法加密銀行資訊');
    }
}

/**
 * Decrypt bank account information
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {number} userId - User's ID
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} - { bankCode, accountNumber, timestamp }
 */
export async function decryptBankInfo(encryptedData, userId, sessionToken) {
    try {
        const key = await generateEncryptionKey(userId, sessionToken);

        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV and ciphertext
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        // Decrypt
        const plaintext = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        const decrypted = decoder.decode(plaintext);

        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('無法解密銀行資訊，請重新設定');
    }
}

/**
 * Save encrypted bank info to localStorage
 * @param {string} bankCode 
 * @param {string} accountNumber 
 * @param {number} userId 
 */
export async function saveBankInfo(bankCode, accountNumber, userId) {
    try {
        // Get current user's session token
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.id !== userId) {
            throw new Error('用戶會話無效');
        }

        // Use email as session token (or you can use a dedicated token)
        const sessionToken = user.email;

        const encrypted = await encryptBankInfo(bankCode, accountNumber, userId, sessionToken);

        // Store in localStorage with user-specific key
        localStorage.setItem(`payment_info_${userId}`, encrypted);

        return true;
    } catch (error) {
        console.error('Save failed:', error);
        throw error;
    }
}

/**
 * Load and decrypt bank info from localStorage
 * @param {number} userId 
 * @returns {Promise<Object|null>} - { bankCode, accountNumber } or null
 */
export async function loadBankInfo(userId) {
    try {
        const encrypted = localStorage.getItem(`payment_info_${userId}`);
        if (!encrypted) {
            return null;
        }

        // Get current user's session token
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.id !== userId) {
            throw new Error('用戶會話無效');
        }

        const sessionToken = user.email;
        const decrypted = await decryptBankInfo(encrypted, userId, sessionToken);

        return {
            bankCode: decrypted.bankCode,
            accountNumber: decrypted.accountNumber
        };
    } catch (error) {
        console.error('Load failed:', error);
        return null;
    }
}

/**
 * Delete bank info from localStorage
 * @param {number} userId 
 */
export function deleteBankInfo(userId) {
    localStorage.removeItem(`payment_info_${userId}`);
}

/**
 * Get masked account number for display
 * @param {string} accountNumber - Full account number
 * @returns {string} - Masked number (e.g., "1234-****-9012")
 */
export function maskAccountNumber(accountNumber) {
    if (!accountNumber || accountNumber.length < 8) {
        return accountNumber;
    }

    // Show first 4 and last 4 digits
    const first = accountNumber.slice(0, 4);
    const last = accountNumber.slice(-4);
    const middle = '*'.repeat(Math.max(4, accountNumber.length - 8));

    return `${first}-${middle}-${last}`;
}

/**
 * Get bank name from bank code
 * @param {string} bankCode - 3-digit bank code
 * @returns {string} - Bank name
 */
export function getBankName(bankCode) {
    const banks = {
        '004': '臺灣銀行',
        '005': '臺灣土地銀行',
        '006': '合作金庫',
        '007': '第一銀行',
        '008': '華南銀行',
        '009': '彰化銀行',
        '011': '上海商業儲蓄銀行',
        '012': '台北富邦',
        '013': '國泰世華',
        '016': '高雄銀行',
        '017': '兆豐銀行',
        '021': '花旗銀行',
        '050': '臺灣企銀',
        '052': '渣打銀行',
        '053': '台中商銀',
        '054': '京城銀行',
        '081': '匯豐銀行',
        '101': '瑞興銀行',
        '102': '華泰銀行',
        '103': '新光銀行',
        '108': '陽信銀行',
        '118': '板信銀行',
        '147': '三信商銀',
        '803': '聯邦銀行',
        '805': '遠東銀行',
        '806': '元大銀行',
        '807': '永豐銀行',
        '808': '玉山銀行',
        '809': '凱基銀行',
        '810': '星展銀行',
        '812': '台新銀行',
        '815': '日盛銀行',
        '816': '安泰銀行',
        '822': '中國信託',
        '824': '連線銀行'
    };

    return banks[bankCode] || `銀行代碼 ${bankCode}`;
}
