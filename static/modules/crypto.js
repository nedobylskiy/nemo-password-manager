export default class Crypto {
    static async encrypt(text, key) {
        // Generate random salt
        const salt = CryptoJS.lib.WordArray.random(128/8);

        // Derive key using PBKDF2
        const derivedKey = CryptoJS.PBKDF2(key, salt, {
            keySize: 256/32,
            iterations: 10000
        });

        // Generate random IV
        const iv = CryptoJS.lib.WordArray.random(128/8);

        // Encrypt the text
        const encrypted = CryptoJS.AES.encrypt(text, derivedKey, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });

        // Combine the salt, iv, and ciphertext
        const result = salt.toString() + iv.toString() + encrypted.toString();
        return result;
    }

    static async decrypt(encryptedData, key) {
        try {
            // Extract salt, iv and ciphertext
            const salt = CryptoJS.enc.Hex.parse(encryptedData.substr(0, 32));
            const iv = CryptoJS.enc.Hex.parse(encryptedData.substr(32, 32));
            const ciphertext = encryptedData.substring(64);

            // Derive key using PBKDF2
            const derivedKey = CryptoJS.PBKDF2(key, salt, {
                keySize: 256/32,
                iterations: 10000
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
                iv: iv,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC
            });

            let decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) {
                throw new Error('Decryption failed');
            }

            return decryptedText;
        } catch (e) {
            throw new Error('Decryption failed');
        }
    }

    static async hash(text) {
        //Sha256 hash
        const hash = CryptoJS.SHA256(text);
        return hash.toString();
    }

    static async makeEnhancedKey(graphicKey, accessKey) {
        let rawKey = String(graphicKey) + String(accessKey);

        let rawHash = await Crypto.hash(rawKey);
        let swaps = parseInt(rawHash.substr(0, 3), 16) % 10;
        for (let i = 0; i < swaps; i++) {
            rawHash = await Crypto.hash(rawHash);
        }


        return CryptoJS.SHA256(rawKey).toString();
    }
}
