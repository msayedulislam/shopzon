import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Question {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  is_answered: boolean;
  created_at: string;
  answers: Answer[];
  user_profile?: {
    full_name: string | null;
  };
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  seller_id: string | null;
  answer: string;
  is_seller_answer: boolean;
  helpful_count: number;
  created_at: string;
  user_profile?: {
    full_name: string | null;
  };
  seller?: {
    shop_name: string;
  };
}

export function useProductQA(productId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch questions for product
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['product-questions', productId],
    queryFn: async () => {
      const { data: questionsData, error } = await supabase
        .from('product_questions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch answers for each question
      const questionsWithAnswers = await Promise.all(
        (questionsData || []).map(async (q) => {
          const { data: answers } = await supabase
            .from('product_answers')
            .select('*')
            .eq('question_id', q.id)
            .order('is_seller_answer', { ascending: false })
            .order('helpful_count', { ascending: false });

          // Fetch user profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', q.user_id)
            .single();

          return {
            ...q,
            answers: answers || [],
            user_profile: profile,
          };
        })
      );

      return questionsWithAnswers as Question[];
    },
    enabled: !!productId,
  });

  // Ask a question
  const askQuestion = useMutation({
    mutationFn: async (question: string) => {
      if (!user) throw new Error('Please login to ask a question');
      
      const { error } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          user_id: user.id,
          question,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
      toast.success('Question submitted!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Answer a question
  const answerQuestion = useMutation({
    mutationFn: async ({ questionId, answer, isSellerAnswer, sellerId }: {
      questionId: string;
      answer: string;
      isSellerAnswer?: boolean;
      sellerId?: string;
    }) => {
      if (!user) throw new Error('Please login to answer');
      
      const { error } = await supabase
        .from('product_answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          answer,
          is_seller_answer: isSellerAnswer || false,
          seller_id: sellerId || null,
        });

      if (error) throw error;

      // Mark question as answered
      await supabase
        .from('product_questions')
        .update({ is_answered: true })
        .eq('id', questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
      toast.success('Answer submitted!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mark answer as helpful
  const markHelpful = useMutation({
    mutationFn: async (answerId: string) => {
      // Get current count and increment
      const { data: currentAnswer } = await supabase
        .from('product_answers')
        .select('helpful_count')
        .eq('id', answerId)
        .single();
      
      const newCount = (currentAnswer?.helpful_count || 0) + 1;
      
      await supabase
        .from('product_answers')
        .update({ helpful_count: newCount })
        .eq('id', answerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
    },
  });

  return {
    questions,
    isLoading,
    askQuestion,
    answerQuestion,
    markHelpful,
    totalQuestions: questions.length,
    answeredQuestions: questions.filter(q => q.is_answered).length,
  };
}
