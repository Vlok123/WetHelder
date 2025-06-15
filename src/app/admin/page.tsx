'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  role: string;
}

interface Question {
  id: string;
  content: string;
  answer: string;
  createdAt: string;
  isHighlight: boolean;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        const usersData = await usersResponse.json();

        if (!usersResponse.ok) {
          throw new Error(usersData.message || 'Er is een fout opgetreden');
        }

        setUsers(usersData.users);

        // Fetch questions
        const questionsResponse = await fetch('/api/admin/questions');
        const questionsData = await questionsResponse.json();

        if (!questionsResponse.ok) {
          throw new Error(questionsData.message || 'Er is een fout opgetreden');
        }

        setQuestions(questionsData.questions);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Er is een fout opgetreden');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchData();
    } else {
      router.push('/');
    }
  }, [session, router]);

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });

      if (!response.ok) {
        throw new Error('Er is een fout opgetreden');
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: !isBlocked } : user
      ));
    } catch (error) {
      setError('Er is een fout opgetreden bij het bijwerken van de gebruiker');
    }
  };

  const toggleQuestionHighlight = async (questionId: string, isHighlight: boolean) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHighlight: !isHighlight }),
      });

      if (!response.ok) {
        throw new Error('Er is een fout opgetreden');
      }

      setQuestions(questions.map(question => 
        question.id === questionId ? { ...question, isHighlight: !isHighlight } : question
      ));
    } catch (error) {
      setError('Er is een fout opgetreden bij het bijwerken van de vraag');
    }
  };

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Gebruikers
            </h2>
            {isLoading ? (
              <div className="text-center text-gray-600">Laden...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isBlocked
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.isBlocked ? 'Geblokkeerd' : 'Actief'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleUserBlock(user.id, user.isBlocked)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                              user.isBlocked
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {user.isBlocked ? 'Deblokkeren' : 'Blokkeren'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Vragen
            </h2>
            {isLoading ? (
              <div className="text-center text-gray-600">Laden...</div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          Door: {question.user.name} ({question.user.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(question.createdAt).toLocaleString('nl-NL')}
                        </p>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                          {question.content}
                        </h3>
                        <p className="mt-2 text-gray-600">{question.answer}</p>
                      </div>
                      <button
                        onClick={() =>
                          toggleQuestionHighlight(question.id, question.isHighlight)
                        }
                        className={`ml-4 px-3 py-1 rounded-md text-sm font-medium ${
                          question.isHighlight
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {question.isHighlight ? 'Uitgelicht' : 'Uitlichten'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 