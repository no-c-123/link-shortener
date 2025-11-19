import { useMemo } from 'react';

const PasswordStrength = ({ password }) => {
    const strength = useMemo(() => {
        if (!password) return { level: 0, label: '', color: '' };
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^a-zA-Z0-9]/.test(password),
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 4) return { level: 3, label: 'Good', color: 'bg-blue-500' };
        return { level: 4, label: 'Strong', color: 'bg-green-500' };
    }, [password]);

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                            level <= strength.level ? strength.color : 'bg-gray-700'
                        }`}
                    />
                ))}
            </div>
            {password && (
                <p className={`text-xs ${
                    strength.level === 1 ? 'text-red-500' :
                    strength.level === 2 ? 'text-yellow-500' :
                    strength.level === 3 ? 'text-blue-500' :
                    'text-green-500'
                }`}>
                    Password strength: {strength.label}
                </p>
            )}
        </div>
    );
};

export default PasswordStrength;

