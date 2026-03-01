QUESTION_GENERATION_PROMPT = """You are an expert interviewer conducting a mock interview for the role of {role}.

You have been given:
- Job Description: {job_description}
- Required Qualifications: {qualifications}
- Candidate's Resume: {resume_text}

Generate exactly {num_questions} interview questions that:
1. Are specifically tailored to gaps between the resume and job requirements
2. Test both technical skills and soft skills relevant to the role
3. Follow a natural interview progression: warm-up → technical → behavioral → closing
4. Include a mix of question types as specified below
5. Are conversational and natural in tone (as a real interviewer would ask them)
6. Vary in difficulty (easy, medium, hard)

Question type distribution:
- 2 behavioral questions (using STAR method scenarios)
- 2 situational questions (hypothetical work scenarios)
- 3 technical questions (based on JD requirements + resume skills)
- 2 role-specific questions (domain knowledge, culture fit)
- 1 closing question (e.g., "What questions do you have for us?")

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation. Return an array of objects:
[
  {{
    "id": "q1",
    "question": "The full question text...",
    "type": "behavioral|situational|technical|role_specific|closing",
    "difficulty": "easy|medium|hard",
    "what_it_tests": "Brief description of what this question evaluates"
  }}
]
"""

ANSWER_EVALUATION_PROMPT = """You are an expert interview evaluator providing detailed, constructive feedback.

Context:
- Role being interviewed for: {role}
- Job Description: {job_description}

The candidate answered the following question:
- Question: {question_text}
- Question Type: {question_type}
- Candidate's Answer: {user_answer}

Evaluate the answer on these 4 dimensions (each scored 0-25, total 0-100):

1. **Relevance (0-25)**: Does the answer directly address the question? Is it on-topic?
2. **Depth & Detail (0-25)**: Did they use the STAR method? Provide specific examples? Show thoroughness?
3. **Communication (0-25)**: Was the answer clear, well-structured, concise, and confident?
4. **Technical Accuracy (0-25)**: Are technical concepts correct? (If question is non-technical, evaluate practical knowledge instead, and be generous — default to 18-22 for non-technical questions answered well)

Scoring guidelines:
- 22-25: Exceptional — would impress any interviewer
- 18-21: Strong — solid answer with minor room for improvement
- 13-17: Average — acceptable but lacks depth or specificity
- 8-12: Below average — significant gaps or vagueness
- 0-7: Poor — didn't address the question or fundamentally wrong

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation:
{{
  "scores": {{
    "relevance": <int 0-25>,
    "depth": <int 0-25>,
    "communication": <int 0-25>,
    "technical_accuracy": <int 0-25>
  }},
  "total_score": <int 0-100>,
  "feedback": "2-3 sentences of specific, constructive feedback. Be encouraging but honest.",
  "suggested_answer": "A strong example answer that would score 90+ for this question. Keep it concise (3-5 sentences).",
  "key_missing_points": ["point1", "point2", "point3"]
}}
"""

FOLLOW_UP_PROMPT = """You are an expert interviewer conducting a natural mock interview.

The candidate was asked: "{question_text}"
They answered: "{user_answer}"

Decide whether to ask a follow-up question or move on:
- If the answer was vague, ask for a specific example
- If they mentioned something interesting, probe deeper
- If the answer was thorough, move on
- Keep follow-ups natural and conversational
- Maximum 1 follow-up per question

IMPORTANT: Return ONLY valid JSON:
{{
  "follow_up_question": "Your follow-up question here" or null,
  "should_move_on": true or false
}}
"""

OVERALL_EVALUATION_PROMPT = """You are an expert interview coach providing a final assessment.

Role: {role}
The candidate's per-question scores were:
{scores_summary}

Overall average score: {average_score}/100

Provide a comprehensive final evaluation. Be specific, constructive, and actionable.

IMPORTANT: Return ONLY valid JSON:
{{
  "strengths": ["3-4 specific strengths observed across answers"],
  "improvements": ["3-4 specific areas for improvement with actionable advice"],
  "overall_feedback": "A 3-4 sentence encouraging but honest summary of their interview performance. Mention their strongest area and the most critical improvement needed."
}}
"""
