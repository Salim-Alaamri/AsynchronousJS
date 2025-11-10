// Fake DB to practice promises_async&await
const users = [
  { id: 1, name: 'Salim', role: 'admin' },
  { id: 2, name: 'Omar', role: 'editor' },
];

const tasks = [
  { id: 1, userId: 1, title: 'Check servers' },
  { id: 2, userId: 1, title: 'Review incidents' },
  { id: 3, userId: 2, title: 'Design graphics' },
];

function getUserById(id) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      const user = users.find(u => u.id === id);

      if (user) {
        res(user);
      } else {
        rej(new Error('User not found'));
      }
    }, 1000);
  });
}

function getTasksByUserId(userId) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      const userTask = tasks.filter(task => task.userId === userId);
      if (userTask.length > 0) {
        res(userTask);
      } else {
        rej(new Error('"No tasks for this user'));
      }
    }, 800);
  });
}

// getUserById(1)
//   .then(user => {
//     console.log('✅ Found:', user.name);
//     return getTasksByUserId(user.id)
//   }).then(tasks => {
//     console.log('Tasks:' );
//     tasks.forEach(task => {
//         console.log('▫️',task.title);
//     });
//   })
//   .catch(err => console.error('❌', err.message));

async function showUserAndTasks(id) {
  try {
    const user = await getUserById(id);
    console.log('✅ Found:', user.name);
    const tasks = await getTasksByUserId(id);
    console.log('Tasks:');
    tasks.forEach(task => console.log('•', task.title));
  } catch (error) {
    console.error('❌', error.message);
  }
}

showUserAndTasks(1);
