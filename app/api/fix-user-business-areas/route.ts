import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    // Create user_business_areas table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_business_areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        business_area VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE CASCADE,
        UNIQUE KEY unique_user_business (user_id, business_area)
      )
    `);

    // Get all users
    const users = await query(`
      SELECT id, email, business_area 
      FROM users 
      WHERE business_area IS NOT NULL
    `);

    let fixedUsers = 0;
    const errors: string[] = [];

    // For each user, ensure they have an entry in user_business_areas
    for (const user of users) {
      try {
        // Check if user already has entries in user_business_areas
        const existingEntriesResult = await query(`
          SELECT COUNT(*) as count 
          FROM user_business_areas 
          WHERE user_id = ?
        `, [user.id]);

        const existingEntries = existingEntriesResult[0] as { count: number };

        if (existingEntries.count === 0) {
          // User doesn't have entries, add their primary business area
          await query(`
            INSERT INTO user_business_areas (user_id, business_area)
            VALUES (?, ?)
          `, [user.id, user.business_area]);
          
          fixedUsers++;
          console.log(`Fixed user ${user.email} with business area ${user.business_area}`);
        }
      } catch (error) {
        errors.push(`Failed to fix user ${user.email}: ${error}`);
        console.error(`Error fixing user ${user.email}:`, error);
      }
    }

    // Get summary of what's in the tables now
    const userBusinessAreasCountResult = await query(`
      SELECT COUNT(*) as count FROM user_business_areas
    `);

    const usersCountResult = await query(`
      SELECT COUNT(*) as count FROM users WHERE business_area IS NOT NULL
    `);

    const userBusinessAreasCount = userBusinessAreasCountResult[0] as { count: number };
    const usersCount = usersCountResult[0] as { count: number };

    return NextResponse.json({
      message: 'User business areas fix completed',
      fixedUsers: fixedUsers,
      totalUsers: usersCount.count,
      totalUserBusinessAreas: userBusinessAreasCount.count,
      errors: errors,
      users: users.map((user: unknown) => ({
        id: (user as { id: number }).id,
        email: (user as { email: string }).email,
        business_area: (user as { business_area: string }).business_area
      }))
    });
  } catch (error) {
    console.error('Error fixing user business areas:', error);
    return NextResponse.json({
      message: 'Error fixing user business areas',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 