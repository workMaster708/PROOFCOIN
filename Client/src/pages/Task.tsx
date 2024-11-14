import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import "../styles/Task.css";

interface TaskItem {
  name: string;
  amount: string;
  icon: string;
}

const Task: React.FC = () => {
  const dailyTasks: TaskItem[] = [
    { name: "Daily Task 1", amount: "50", icon: "path/to/icon1.png" },
    { name: "Daily Task 2", amount: "100", icon: "path/to/icon2.png" },
  ];
  
  const specialTasks: TaskItem[] = [
    { name: "Special Task 1", amount: "200", icon: "path/to/icon3.png" },
    { name: "Special Task 2", amount: "300", icon: "path/to/icon4.png" },
  ];

  return (
    <div className="task-page">
      <header className="task-header">
        <TonConnectButton className="Tbtn" />
      </header>

      {/* Daily Tasks Section */}
      <div className="task-section">
        <h3>Daily Tasks</h3>
        <ul className="task-list">
          {dailyTasks.map((task, index) => (
            <li key={index} className="task-item">
              <div className="task-icon">
                <img src={task.icon} alt={task.name} />
              </div>
              <div className="task-info">
                <span>{task.name}</span>
                <span className="task-points">+{task.amount} 🔎</span>
              </div>
              <button className="transaction-btn disabled">Go to Task</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Special Tasks Section */}
      <div className="task-section">
        <h3>Special Tasks</h3>
        <ul className="task-list">
          {specialTasks.map((task, index) => (
            <li key={index} className="task-item">
              <div className="task-icon">
                <img src={task.icon} alt={task.name} />
              </div>
              <div className="task-info">
                <span>{task.name}</span>
                <span className="task-points">+{task.amount} 🔎</span>
              </div>
              <button className="transaction-btn disabled">Go to Task</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Task;
