# CHECKLIST DE PRUEBAS 
# Ejecutar estas pruebas después de cambios importantes

// pruebas-login.js - Copia y pega en la consola

const PruebasLogin = {
    ejecutar() {
        console.log("=== PRUEBAS DE LOGIN ===\n");
        
        // 1. Campos vacíos
        console.log("📝 Probando validación de campos vacíos...");
        this.simularEnvio(''Completa este campo'');
        
        // 2. Email inválido
        console.log("📝 Probando email inválido...");
        this.simularEnvio('Usuario o Contraseña incorrectos');
        
        // 3. Contraseña corta
        console.log("📝 Probando contraseña corta...");
        this.simularEnvio('usuario@test.com', '123');
        
        // 4. Datos válidos
        console.log("📝 Probando datos válidos...");
        this.simularEnvio('usuario@test.com', '12345678');
    },
    
    simularEnvio(email, password) {
        const emailValido = email.includes('@') && email.includes('.');
        const passValido = password.length >= 6;
        
        if (!emailValido) console.log("❌ Email inválido detectado");
        if (!passValido) console.log("❌ Contraseña muy corta (mínimo 6 caracteres)");
        if (emailValido && passValido) console.log("✅ Datos válidos listos para enviar");
        console.log("---");
    }
};

PruebasLogin.ejecutar();