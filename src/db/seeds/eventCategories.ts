import { db } from '@/db';
import { eventCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Technology',
            description: 'Tech conferences, hackathons, product launches, coding bootcamps, and innovation showcases.',
            color: '#3B82F6'
        },
        {
            name: 'Cultural',
            description: 'Cultural festivals, heritage celebrations, food fairs, and community gatherings.',
            color: '#F59E0B'
        },
        {
            name: 'Academic',
            description: 'Lectures, seminars, research presentations, academic conferences, and educational workshops.',
            color: '#10B981'
        },
        {
            name: 'Sports',
            description: 'Athletic competitions, tournaments, fitness events, and recreational sports activities.',
            color: '#EF4444'
        },
        {
            name: 'Arts',
            description: 'Art exhibitions, gallery openings, creative showcases, and visual arts performances.',
            color: '#8B5CF6'
        },
        {
            name: 'Music',
            description: 'Concerts, recitals, music festivals, open mic nights, and musical performances.',
            color: '#EC4899'
        },
        {
            name: 'Workshop',
            description: 'Hands-on learning sessions, skill-building workshops, and interactive training programs.',
            color: '#06B6D4'
        },
        {
            name: 'Competition',
            description: 'Contests, challenges, tournaments, and competitive events across various disciplines.',
            color: '#F97316'
        }
    ];

    await db.insert(eventCategories).values(sampleCategories);
    
    console.log('✅ Event categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});