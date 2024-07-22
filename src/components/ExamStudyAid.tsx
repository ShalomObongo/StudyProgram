'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from './DarkModeToggle';
import { useDarkMode } from '@/contexts/DarkModeContext';

const topics = [
  {
    title: "Matrix Algebra",
    subtopics: [
      "Add, subtract and do scalar multiplication of matrices",
      "Multiplication of matrices",
      "Finding inverse of matrix (2*2, 3*3, 4*4, etc.)"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/matrix-algebra/" },
      { type: "Video", link: "https://www.youtube.com/watch?v=yRwQ7A6jVLk" }
    ]
  },
  {
    title: "Input-Output Models",
    subtopics: [
      "Explain properties of Input-Output problem",
      "Solve Two and Three industry models"
    ],
    resources: [
      { type: "Notes", link: "https://www.investopedia.com/terms/i/input-output-analysis.asp" },
      { type: "Video", link: "https://study.com/academy/lesson/input-output-model.html" }
    ]
  },
  {
    title: "Markov Chains",
    subtopics: [
      "Define a Markov Chain",
      "Explain properties of a Markov Chain",
      "Formulate transition probability matrix",
      "Solve steady state probabilities/Long-run probabilities"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/probability/markov-chains" },
      { type: "Video", link: "https://www.youtube.com/watch?v=0X1c9x9T8H4" }
    ]
  },
  {
    title: "Linear Programming",
    subtopics: [
      "Explain properties of Linear Programming (LPP)",
      "Formulate LPP",
      "Solve LPP using graphical method"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/linear-programming" },
      { type: "Video", link: "https://www.youtube.com/watch?v=Bzzqx1F23a8" }
    ]
  },
  {
    title: "Simplex Method",
    subtopics: [
      "Explain basic terms in Simplex Analysis",
      "Solve LPP using simplex method"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/simplex-method" },
      { type: "Video", link: "https://www.youtube.com/watch?v=3b4xT6cW8rM" }
    ]
  },
  {
    title: "Duality & Sensitivity Analysis",
    subtopics: [
      "Define the dual of a LPP",
      "Perform Sensitivity Analysis on LPP",
      "Apply sensitivity analysis in interpretation of business problems"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/duality" },
      { type: "Video", link: "https://www.youtube.com/watch?v=Kqz6L8s6h3E" }
    ]
  },
  {
    title: "Transportation Problems",
    subtopics: [
      "Distinguish between demand and supply variables",
      "Solve a transportation problem using the North West Method",
      "Using the Least Cost Cell Method to solve transportation problem"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/transportation-problem" },
      { type: "Video", link: "https://www.youtube.com/watch?v=G2mZ2p3w1L0" }
    ]
  },
  {
    title: "Assignment Problems",
    subtopics: [
      "Differentiate between Transportation and Assignment Models",
      "Solve Assignment Problems for workers, Machines etc."
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/assignment-problem" },
      { type: "Video", link: "https://www.youtube.com/watch?v=6ZcZs2Y3g7A" }
    ]
  },
  {
    title: "Network Models & Project Scheduling",
    subtopics: [
      "Explain Project Management Model",
      "Construct a Project Network",
      "Construct the Critical Path (CP) through the network",
      "Solve the network problem using PERT"
    ],
    resources: [
      { type: "Notes", link: "https://www.statlect.com/optimization/network-flow" },
      { type: "Video", link: "https://www.youtube.com/watch?v=6kDgU5YgZ7A" }
    ]
  }
];

const ExamStudyAid = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Link href="/" className="mb-4 block">
          <Button variant="outline">Back to Study Program</Button>
        </Link>
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ICS 3106: Operations Research Study Guide</CardTitle>
          <CardDescription>Interactive study guide for Operations Research topics</CardDescription>
        </CardHeader>
      </Card>
      
      <Accordion type="single" collapsible>
        {topics.map((topic, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{topic.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 mb-4">
                {topic.subtopics.map((subtopic, subIndex) => (
                  <li key={subIndex} className="mb-2">{subtopic}</li>
                ))}
              </ul>
              <div className="flex space-x-4">
                {topic.resources.map((resource, resIndex) => (
                  <a
                    key={resIndex}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {resource.type}
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ExamStudyAid;