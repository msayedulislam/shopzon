import { useState } from 'react';
import { MessageCircle, ThumbsUp, User, Store, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProductQA } from '@/hooks/useProductQA';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ProductQAProps {
  productId: string;
  sellerId?: string;
}

export function ProductQA({ productId, sellerId }: ProductQAProps) {
  const [showAll, setShowAll] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  
  const { user, isApprovedSeller } = useAuth();
  const { 
    questions, 
    isLoading, 
    askQuestion, 
    answerQuestion, 
    markHelpful,
    totalQuestions,
    answeredQuestions,
  } = useProductQA(productId);

  const displayedQuestions = showAll ? questions : questions.slice(0, 3);

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;
    askQuestion.mutate(newQuestion);
    setNewQuestion('');
  };

  const handleAnswer = (questionId: string) => {
    if (!newAnswer.trim()) return;
    answerQuestion.mutate({
      questionId,
      answer: newAnswer,
      isSellerAnswer: isApprovedSeller,
      sellerId: isApprovedSeller ? sellerId : undefined,
    });
    setNewAnswer('');
    setAnsweringId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Questions & Answers
          </div>
          <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <span>{answeredQuestions}/{totalQuestions} answered</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ask Question */}
        {user && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Have a question? Ask sellers and other customers..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[60px]"
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={!newQuestion.trim() || askQuestion.isPending}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Questions List */}
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          <div className="space-y-4">
            {displayedQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {question.user_profile?.full_name || 'Customer'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{question.question}</p>
                  </div>
                </div>

                {/* Answers */}
                {question.answers.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {question.answers.map((answer) => (
                      <div 
                        key={answer.id} 
                        className={`p-3 rounded-lg ${
                          answer.is_seller_answer 
                            ? 'bg-primary/5 border border-primary/20' 
                            : 'bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {answer.is_seller_answer ? (
                            <>
                              <Store className="h-4 w-4 text-primary" />
                              <Badge variant="secondary" className="text-xs">Seller</Badge>
                            </>
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{answer.answer}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 gap-1 text-xs"
                          onClick={() => markHelpful.mutate(answer.id)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({answer.helpful_count})
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Input */}
                {user && answeringId === question.id ? (
                  <div className="ml-8 flex gap-2">
                    <Textarea
                      placeholder="Write your answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleAnswer(question.id)}
                        disabled={!newAnswer.trim()}
                      >
                        Submit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAnsweringId(null);
                          setNewAnswer('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-8"
                    onClick={() => setAnsweringId(question.id)}
                  >
                    Answer this question
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less */}
        {questions.length > 3 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All {questions.length} Questions
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
