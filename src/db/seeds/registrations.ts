import { db } from '@/db';
import { registrations } from '@/db/schema';

async function main() {
    const sampleRegistrations = [
        // User 1 - Active participant
        { userId: 1, eventId: 1, registeredAt: new Date('2024-01-12').toISOString(), attendanceStatus: 'present' },
        { userId: 1, eventId: 5, registeredAt: new Date('2024-01-18').toISOString(), attendanceStatus: 'pending' },
        { userId: 1, eventId: 12, registeredAt: new Date('2024-02-03').toISOString(), attendanceStatus: 'pending' },
        
        // User 2 - Mixed attendance
        { userId: 2, eventId: 1, registeredAt: new Date('2024-01-11').toISOString(), attendanceStatus: 'present' },
        { userId: 2, eventId: 3, registeredAt: new Date('2024-01-16').toISOString(), attendanceStatus: 'absent' },
        { userId: 2, eventId: 8, registeredAt: new Date('2024-01-25').toISOString(), attendanceStatus: 'pending' },
        { userId: 2, eventId: 15, registeredAt: new Date('2024-02-05').toISOString(), attendanceStatus: 'pending' },
        
        // User 3 - Reliable attendee
        { userId: 3, eventId: 2, registeredAt: new Date('2024-01-13').toISOString(), attendanceStatus: 'present' },
        { userId: 3, eventId: 4, registeredAt: new Date('2024-01-17').toISOString(), attendanceStatus: 'present' },
        { userId: 3, eventId: 7, registeredAt: new Date('2024-01-22').toISOString(), attendanceStatus: 'pending' },
        
        // User 4 - Regular participant
        { userId: 4, eventId: 1, registeredAt: new Date('2024-01-13').toISOString(), attendanceStatus: 'present' },
        { userId: 4, eventId: 6, registeredAt: new Date('2024-01-20').toISOString(), attendanceStatus: 'pending' },
        { userId: 4, eventId: 11, registeredAt: new Date('2024-02-01').toISOString(), attendanceStatus: 'pending' },
        { userId: 4, eventId: 18, registeredAt: new Date('2024-02-08').toISOString(), attendanceStatus: 'pending' },
        
        // User 5 - Occasional participant
        { userId: 5, eventId: 3, registeredAt: new Date('2024-01-15').toISOString(), attendanceStatus: 'pending' },
        { userId: 5, eventId: 9, registeredAt: new Date('2024-01-27').toISOString(), attendanceStatus: 'pending' },
        
        // User 6 - Enthusiastic participant
        { userId: 6, eventId: 2, registeredAt: new Date('2024-01-12').toISOString(), attendanceStatus: 'present' },
        { userId: 6, eventId: 5, registeredAt: new Date('2024-01-19').toISOString(), attendanceStatus: 'pending' },
        { userId: 6, eventId: 10, registeredAt: new Date('2024-01-29').toISOString(), attendanceStatus: 'pending' },
        { userId: 6, eventId: 14, registeredAt: new Date('2024-02-04').toISOString(), attendanceStatus: 'pending' },
        { userId: 6, eventId: 17, registeredAt: new Date('2024-02-07').toISOString(), attendanceStatus: 'pending' },
        
        // User 7 - Selective participant
        { userId: 7, eventId: 4, registeredAt: new Date('2024-01-16').toISOString(), attendanceStatus: 'present' },
        { userId: 7, eventId: 13, registeredAt: new Date('2024-02-02').toISOString(), attendanceStatus: 'pending' },
        
        // User 8 - New participant
        { userId: 8, eventId: 6, registeredAt: new Date('2024-01-21').toISOString(), attendanceStatus: 'pending' },
        { userId: 8, eventId: 16, registeredAt: new Date('2024-02-06').toISOString(), attendanceStatus: 'pending' },
        { userId: 8, eventId: 19, registeredAt: new Date('2024-02-09').toISOString(), attendanceStatus: 'pending' },
        
        // User 9 - Inconsistent participant
        { userId: 9, eventId: 7, registeredAt: new Date('2024-01-23').toISOString(), attendanceStatus: 'absent' },
        { userId: 9, eventId: 11, registeredAt: new Date('2024-02-01').toISOString(), attendanceStatus: 'pending' },
        
        // User 10 - Active participant
        { userId: 10, eventId: 8, registeredAt: new Date('2024-01-24').toISOString(), attendanceStatus: 'pending' },
        { userId: 10, eventId: 12, registeredAt: new Date('2024-02-03').toISOString(), attendanceStatus: 'pending' },
        { userId: 10, eventId: 20, registeredAt: new Date('2024-02-10').toISOString(), attendanceStatus: 'pending' },
        
        // Additional registrations for popular events
        { userId: 3, eventId: 1, registeredAt: new Date('2024-01-14').toISOString(), attendanceStatus: 'present' },
        { userId: 5, eventId: 1, registeredAt: new Date('2024-01-14').toISOString(), attendanceStatus: 'absent' },
        { userId: 7, eventId: 2, registeredAt: new Date('2024-01-13').toISOString(), attendanceStatus: 'present' },
        { userId: 8, eventId: 2, registeredAt: new Date('2024-01-13').toISOString(), attendanceStatus: 'pending' },
        { userId: 9, eventId: 3, registeredAt: new Date('2024-01-15').toISOString(), attendanceStatus: 'pending' },
        { userId: 10, eventId: 3, registeredAt: new Date('2024-01-16').toISOString(), attendanceStatus: 'pending' },
    ];

    await db.insert(registrations).values(sampleRegistrations);
    
    console.log('✅ Registrations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});