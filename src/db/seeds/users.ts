import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const saltRounds = 12;
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const sampleUsers = [
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            passwordHash: hashedPassword,
            role: 'admin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff&size=200',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            passwordHash: hashedPassword,
            role: 'admin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=059669&color=fff&size=200',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Emma Rodriguez',
            email: 'emma.rodriguez@company.com',
            passwordHash: hashedPassword,
            role: 'admin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=dc2626&color=fff&size=200',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'David Thompson',
            email: 'david.thompson@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: 'https://ui-avatars.com/api/?name=David+Thompson&background=7c3aed&color=fff&size=200',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Lisa Wang',
            email: 'lisa.wang@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: null,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'James Miller',
            email: 'james.miller@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: 'https://ui-avatars.com/api/?name=James+Miller&background=ea580c&color=fff&size=200',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Priya Patel',
            email: 'priya.patel@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Patel&background=0891b2&color=fff&size=200',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Robert Garcia',
            email: 'robert.garcia@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: null,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Amanda Lee',
            email: 'amanda.lee@company.com',
            passwordHash: hashedPassword,
            role: 'user',
            avatarUrl: 'https://ui-avatars.com/api/?name=Amanda+Lee&background=be185d&color=fff&size=200',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});