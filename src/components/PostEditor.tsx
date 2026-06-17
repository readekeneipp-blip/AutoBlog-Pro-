import { Calendar, Globe, FileText, CheckCircle2, Edit3 } from 'lucide-react';
import SEOAnalysis from './SEOAnalysis';
import { useMemo } from 'react';

interface PostEditorProps {
  content: string;
  setContent: (content: string) => void;
  topic: string;
  keywords: string;
  scheduleTime: string;
  setScheduleTime: (time: string) => void;
  handleSchedule: () => void;
}

const PostEditor = ({ content, setContent, topic, keywords, scheduleTime, setScheduleTime, handleSchedule }: PostEditorProps) => {
  
  const seoData = useMemo(() => {
    if (!content) return { score: 0, readability: 'N/A', suggestions: [] };

    let score = 50;
    const suggestions: string[] = [];
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    // 1. Keyword check
    const contentLower = content.toLowerCase();
    let foundKeywords = 0;
    keywordList.forEach(kw => {
      if (contentLower.includes(kw)) {
        foundKeywords++;
      }
    });

    if (keywordList.length > 0) {
      if (foundKeywords === keywordList.length) {
        score += 20;
        suggestions.push('Good: All keywords are present in the content.');
      } else if (foundKeywords > 0) {
        score += 10;
        suggestions.push(`Improvement: Only ${foundKeywords}/${keywordList.length} keywords found.`);
      } else {
        suggestions.push('Critical: No focus keywords found in the content.');
      }
    }

    // 2. Topic in content
    if (topic && contentLower.includes(topic.toLowerCase())) {
      score += 10;
      suggestions.push('Good: Topic mentioned in the text.');
    } else if (topic) {
      suggestions.push('Improvement: Consider mentioning the exact topic in the content.');
    }

    // 3. Subheaders
    const subheaderCount = (content.match(/^#{2,3}\s/gm) || []).length;
    if (subheaderCount >= 3) {
      score += 10;
      suggestions.push('Good: Proper use of subheaders (H2, H3).');
    } else {
      suggestions.push('Improvement: Add more subheaders for better structure.');
    }

    // 4. Content length
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount >= 600) {
      score += 10;
      suggestions.push('Good: Content length is SEO-friendly (600+ words).');
    } else {
      suggestions.push('Improvement: Content is a bit short. Aim for 600-1000 words.');
    }

    // 5. Readability
    let readability = 'Easy';
    if (wordCount > 1000) readability = 'Moderate';
    if (wordCount > 2000) readability = 'Complex';

    return {
      score: Math.min(score, 100),
      readability,
      suggestions
    };
  }, [content, keywords, topic]);

  return (
    <div className="bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl h-full">
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <Calendar className="w-4 h-4 text-primary-400" />
          <input 
            type="datetime-local" 
            value={scheduleTime} 
            onChange={e => setScheduleTime(e.target.value)} 
            className="bg-transparent text-xs text-white outline-none" 
          />
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={handleSchedule} 
            disabled={!content} 
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
          >
            <Globe className="w-4 h-4" /> 
            Schedule & Publish
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col text-slate-300 bg-slate-950/30 overflow-hidden">
          {content ? (
            <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-hidden">
               <div className="flex items-center justify-between mb-8 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    AI Generation Complete
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-normal">
                    <Edit3 className="w-3 h-3" />
                    Editable Mode
                  </div>
               </div>
               
               <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-lg leading-relaxed text-slate-300 placeholder:text-slate-700 w-full overflow-y-auto pr-4 scrollbar-thin"
                placeholder="Start writing or generate content..."
               />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 py-20">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <FileText className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-medium text-lg italic">Post will appear here after generation...</p>
            </div>
          )}
        </div>

        {content && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/30 p-6 overflow-y-auto shrink-0">
            <SEOAnalysis {...seoData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostEditor;
