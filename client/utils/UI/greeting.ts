export const getGreeting = () => {
  const hour = new Date().getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = 'profile.greetings.morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'profile.greetings.afternoon';
  } else {
    greeting = 'profile.greetings.evening';
  }

  return greeting;
};
