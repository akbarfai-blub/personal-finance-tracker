# Personal Finance Dashboard

A clean, minimalist, and secure personal finance tracking dashboard. Built to monitor daily expenses and income, complete with data visualization and secure user authentication.

## Features

* **Secure Authentication:** User login and session management securely handled by Supabase Auth.
* **Data Aggregation:** Real-time calculation of total balance, income, and expenses.
* **Data Visualization:** Interactive donut chart for expense categorization using Recharts.
* **CRUD Operations:** Seamless addition of new financial transactions.
* **Data Privacy:** Implemented Row Level Security (RLS) in PostgreSQL to ensure user data isolation.

## Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **Visualization:** Recharts
* **Backend & Database:** Supabase (PostgreSQL)
* **Deployment:** Vercel

## Database Schema

The application relies on a structured PostgreSQL database hosted on Supabase.

**Table: `transactions`**

| Column        | Type        | Default Value  | Description                          |
| :------------ | :---------- | :------------- | :----------------------------------- |
| `id`          | `uuid`      | `gen_random_uuid()` | Unique transaction identifier.  |
| `date`        | `date`      | `now()`        | Date of the transaction.             |
| `amount`      | `int8`      | `0`            | Transaction value in IDR.            |
| `description` | `text`      | `null`         | Details of the transaction.          |
| `category`    | `text`      | `null`         | E.g., Food, Transport, Salary.       |
| `type`        | `text`      | `null`         | 'income' or 'expense'.               |
| `user_id`     | `uuid`      | `auth.uid()`   | Foreign key to Supabase Auth users.  |

> **Note on Security:** Row Level Security (RLS) is strictly enforced on this table. Users can only `SELECT` and `INSERT` records where `user_id` matches their authenticated session.

## Local Development

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)[username-github-kamu]/personal-finance-dashboard.git
   cd personal-finance-dashboard