
export async function getServerSession() {
  // Mock session for development
  // In a real app, this would use better-auth or next-auth to get the session
  // from headers/cookies.
  return {
    user: {
      id: 'mock-organizer-id', // Fixed ID for mock data consistency
      name: 'Demo Organizer',
      email: 'organizer@datesetmatch.com',
      image: null,
    }
  };
}
