export type AnalyticsEvent = {
  user_id: string;
  session_id: string;
  event_type:
    | 'page_view'
    | 'account_created'
    | 'recipient_profile_created'
    | 'questionnaire_completed'
    | 'gift_ideas_generated'
    | 'gift_idea_saved'
    | 'outbound_link_clicked'
    | 'reminder_created';
  timestamp: string;
  metadata?: Record<string, any>;
};

export type ProductRecommendation = {
  idea_id: string;
  product_name: string;
  category: string;
  shop_name: string;
  url: string;
};

function generateUserId(index: number): string {
  return `u${String(index).padStart(5, '0')}`;
}

function generateSessionId(userIndex: number, sessionIndex: number): string {
  return `s${String(userIndex).padStart(5, '0')}_${sessionIndex}`;
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function addMinutes(dateString: string, minutes: number): string {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

const categories = ['jewellery', 'home', 'fashion', 'tech', 'books', 'beauty', 'food', 'experiences', 'toys'];
const shops = [
  'Example Shop', 'Calm Home', 'Tech Haven', 'Beauty Bliss', 'Fashion Forward',
  'Gourmet Gifts', 'Book Nook', 'Jewel Box', 'Experience Co', 'Toy World'
];
const pages = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/people', name: 'People' },
  { path: '/gift-ideas', name: 'Gift Ideas' },
  { path: '/reminders', name: 'Reminders' },
  { path: '/settings', name: 'Settings' },
  { path: '/partners', name: 'Partners' }
];
const relationshipTypes = ['partner', 'friend', 'family', 'colleague'];
const ageRanges = ['18-25', '25-34', '35-44', '45-54', '55+'];
const occasions = ['birthday', 'anniversary', 'christmas', 'graduation', 'wedding', 'thank_you'];

const productNames = [
  'Gold pendant necklace', 'Scented soy candle', 'Wireless earbuds', 'Coffee table book',
  'Silk scarf', 'Smart watch', 'Luxury skincare set', 'Artisan chocolate box',
  'Leather wallet', 'Spa day voucher', 'Cooking class', 'Wine tasting experience',
  'Designer sunglasses', 'Ceramic vase', 'Board game collection', 'Fitness tracker'
];

function generateMockEvents(): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const endDate = new Date('2025-11-23');
  const startDate = new Date('2025-10-01');

  const numUsers = 250;

  for (let i = 1; i <= numUsers; i++) {
    const userId = generateUserId(i);
    const numSessions = Math.floor(Math.random() * 3) + 1;

    for (let s = 0; s < numSessions; s++) {
      const sessionId = generateSessionId(i, s);
      let sessionStart = randomDate(startDate, endDate);

      const shouldComplete = Math.random() > 0.3;

      events.push({
        user_id: userId,
        session_id: sessionId,
        event_type: 'page_view',
        timestamp: sessionStart,
        metadata: {
          page: pages[0].path,
          page_name: pages[0].name
        }
      });

      if (s === 0) {
        sessionStart = addMinutes(sessionStart, 1);
        events.push({
          user_id: userId,
          session_id: sessionId,
          event_type: 'account_created',
          timestamp: sessionStart
        });
      }

      for (let pv = 0; pv < Math.floor(Math.random() * 4) + 1; pv++) {
        sessionStart = addMinutes(sessionStart, Math.random() * 2);
        const page = pages[Math.floor(Math.random() * pages.length)];
        events.push({
          user_id: userId,
          session_id: sessionId,
          event_type: 'page_view',
          timestamp: sessionStart,
          metadata: {
            page: page.path,
            page_name: page.name
          }
        });
      }

      if (shouldComplete && Math.random() > 0.2) {
        sessionStart = addMinutes(sessionStart, 2);
        events.push({
          user_id: userId,
          session_id: sessionId,
          event_type: 'recipient_profile_created',
          timestamp: sessionStart,
          metadata: {
            relationship_type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
            recipient_age_range: ageRanges[Math.floor(Math.random() * ageRanges.length)]
          }
        });

        if (Math.random() > 0.25) {
          sessionStart = addMinutes(sessionStart, 3);
          events.push({
            user_id: userId,
            session_id: sessionId,
            event_type: 'questionnaire_completed',
            timestamp: sessionStart
          });

          if (Math.random() > 0.15) {
            sessionStart = addMinutes(sessionStart, 0.5);
            const numIdeas = Math.floor(Math.random() * 6) + 3;
            const ideas: ProductRecommendation[] = [];

            for (let g = 0; g < numIdeas; g++) {
              const category = categories[Math.floor(Math.random() * categories.length)];
              const shop = shops[Math.floor(Math.random() * shops.length)];
              const productName = productNames[Math.floor(Math.random() * productNames.length)];

              ideas.push({
                idea_id: `idea_${i}_${s}_${g}`,
                product_name: productName,
                category,
                shop_name: shop,
                url: `https://${shop.toLowerCase().replace(/\s+/g, '-')}.com/product/${Math.floor(Math.random() * 1000)}`
              });
            }

            events.push({
              user_id: userId,
              session_id: sessionId,
              event_type: 'gift_ideas_generated',
              timestamp: sessionStart,
              metadata: { ideas }
            });

            if (Math.random() > 0.3 && ideas.length > 0) {
              const numSaves = Math.floor(Math.random() * Math.min(3, ideas.length)) + 1;

              for (let sv = 0; sv < numSaves; sv++) {
                sessionStart = addMinutes(sessionStart, 1);
                const savedIdea = ideas[sv];
                events.push({
                  user_id: userId,
                  session_id: sessionId,
                  event_type: 'gift_idea_saved',
                  timestamp: sessionStart,
                  metadata: {
                    idea_id: savedIdea.idea_id,
                    category: savedIdea.category,
                    relationship_type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
                  }
                });

                if (Math.random() > 0.4) {
                  sessionStart = addMinutes(sessionStart, 0.5);
                  events.push({
                    user_id: userId,
                    session_id: sessionId,
                    event_type: 'outbound_link_clicked',
                    timestamp: sessionStart,
                    metadata: {
                      idea_id: savedIdea.idea_id,
                      url: savedIdea.url,
                      shop_name: savedIdea.shop_name,
                      category: savedIdea.category
                    }
                  });
                }
              }

              if (Math.random() > 0.5) {
                sessionStart = addMinutes(sessionStart, 2);
                const reminderDate = new Date(sessionStart);
                reminderDate.setDate(reminderDate.getDate() + Math.floor(Math.random() * 60) + 7);

                events.push({
                  user_id: userId,
                  session_id: sessionId,
                  event_type: 'reminder_created',
                  timestamp: sessionStart,
                  metadata: {
                    occasion: occasions[Math.floor(Math.random() * occasions.length)],
                    reminder_date: reminderDate.toISOString().split('T')[0]
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const mockEvents: AnalyticsEvent[] = generateMockEvents();
