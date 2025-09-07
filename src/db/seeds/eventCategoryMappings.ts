import { db } from '@/db';
import { eventCategoryMappings } from '@/db/schema';

async function main() {
    const sampleMappings = [
        // Tech workshops → Technology category
        { eventId: 1, categoryId: 1 },
        { eventId: 2, categoryId: 1 },
        { eventId: 3, categoryId: 1 },
        { eventId: 4, categoryId: 1 },
        { eventId: 5, categoryId: 1 },
        
        // Cultural festivals → Cultural category
        { eventId: 6, categoryId: 2 },
        { eventId: 7, categoryId: 2 },
        { eventId: 8, categoryId: 2 },
        
        // Academic seminars → Academic category
        { eventId: 9, categoryId: 3 },
        { eventId: 10, categoryId: 3 },
        { eventId: 11, categoryId: 3 },
        
        // Sports events → Sports category
        { eventId: 12, categoryId: 4 },
        { eventId: 13, categoryId: 4 },
        
        // Art exhibitions → Arts category
        { eventId: 14, categoryId: 5 },
        { eventId: 15, categoryId: 5 },
        
        // Music concerts → Music category
        { eventId: 16, categoryId: 6 },
        { eventId: 17, categoryId: 6 },
        
        // Workshops → Workshop category
        { eventId: 18, categoryId: 7 },
        { eventId: 19, categoryId: 7 },
        
        // Competitions → Competition category
        { eventId: 20, categoryId: 8 },
        
        // Additional mappings for events with multiple categories
        { eventId: 1, categoryId: 7 }, // Tech workshop also in Workshop category
        { eventId: 6, categoryId: 5 }, // Cultural festival also in Arts category
        { eventId: 14, categoryId: 2 }, // Art exhibition also in Cultural category
        { eventId: 16, categoryId: 2 }, // Music concert also in Cultural category
        { eventId: 20, categoryId: 4 }, // Competition also in Sports category
        { eventId: 3, categoryId: 7 }, // Tech workshop also in Workshop category
        { eventId: 12, categoryId: 8 }, // Sports event also in Competition category
        { eventId: 18, categoryId: 1 }, // Workshop also in Technology category
    ];

    await db.insert(eventCategoryMappings).values(sampleMappings);
    
    console.log('✅ Event category mappings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});