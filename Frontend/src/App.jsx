import { useState } from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Paper,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { LightMode, DarkMode, ContentCopy, Download } from "@mui/icons-material";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";
import "./App.css";

// Helper to parse review markdown into sections
function parseSections(markdown) {
  // Split by headings (## ...)
  const sectionRegex = /^(##\s*[\w🛠️🏷️🔍💡🌟🧪📝🔒📦]+.*)$/gim;
  const parts = markdown.split(sectionRegex).filter(Boolean);

  // The first part may be text before the first heading (ignore)
  let sections = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("##")) {
      const title = parts[i].replace(/^##\s*/, "").trim();
      const content = parts[i + 1] ? parts[i + 1].trim() : "";
      sections.push({ title, content });
      i++;
    }
  }
  return sections;
}

// Helper to extract verdict (Good/Bad) from Code Verdict section
function extractVerdict(content) {
  if (!content) return "";
  if (/good/i.test(content) || /✅/.test(content)) return "Good";
  if (/bad/i.test(content) || /❌/.test(content)) return "Bad";
  return "";
}

function App() {
  const [code, setCode] = useState(`print("Hello, World!")`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleThemeToggle = () => setDarkMode((d) => !d);
 
  const reviewCode = async () => {
    setLoading(true);
    setReview("");
    try {
const response = await axios.post(`${VITE_BACKEND_URL}/ai/get-review`, { code });      setReview(response.data.review);
    } catch (err) {
      setReview("❌ Could not connect to backend.");
    }
    setLoading(false);
  };

  // Copies only the code (not the review text)
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  // Copies the review text (all)
  const handleCopyReview = () => {
    navigator.clipboard.writeText(review);
  };

  const handleDownload = () => {
    const blob = new Blob([review], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "review.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse review into sections
  const sections = review ? parseSections(review) : [];

  // Find Code Verdict section and keep it at the top
  const codeVerdictSection = sections.find((s) => /^🏷️?\s*Code Verdict/i.test(s.title));
  const otherSections = sections.filter((s) => !/^🏷️?\s*Code Verdict/i.test(s.title));

  // Helper to copy section text
  const handleCopySection = (title, content) => {
    navigator.clipboard.writeText(`## ${title}\n${content}`);
  };

  // Helper to copy only code block from Recommended Fix
  const handleCopyRecommendedFixCode = (content) => {
    // Extract code block
    const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
    if (match) {
      navigator.clipboard.writeText(match[2].trim());
    }
  };

  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#181a20" : "#f5f5f5",
        minHeight: "100vh",
        color: darkMode ? "#fff" : "#222",
        transition: "background 0.3s",
      }}
    >
      <CssBaseline />
      <AppBar
        position="static"
        sx={{
          bgcolor: darkMode ? "#23272f" : "#fff",
          color: darkMode ? "#fff" : "#23272f",
          boxShadow: "none",
          borderBottom: `1px solid ${darkMode ? "#333" : "#eee"}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            AI Code Reviewer
          </Typography>
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          p: { xs: 2, md: 4 },
          maxWidth: "1400px",
          mx: "auto",
        }}
      >
        {/* Code Editor Panel */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 2,
            bgcolor: darkMode ? "#23272f" : "#fff",
            minHeight: 400,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: darkMode ? "#fff" : "#222" }}>
              Paste your code here
            </Typography>
            <Tooltip title="Copy code">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleCopyCode}
                  disabled={!code}
                  size="small"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              overflow: "hidden",
              border: `1px solid ${darkMode ? "#333" : "#ddd"}`,
              background: darkMode ? "#181a20" : "#fafafa",
            }}
          >
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={16}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 16,
                minHeight: 200,
                background: "none",
                color: darkMode ? "#fff" : "#222",
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={reviewCode}
            disabled={loading}
            sx={{
              alignSelf: "flex-end",
              mt: 1,
              fontWeight: 600,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Review Code"}
          </Button>
        </Paper>
        {/* Review Panel */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 2,
            bgcolor: darkMode ? "#23272f" : "#fff",
            minHeight: 400,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: darkMode ? "#fff" : "#222" }}>
              Review Result
            </Typography>
            <Tooltip title="Copy review">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleCopyReview}
                  disabled={!review}
                  size="small"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Download review">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleDownload}
                  disabled={!review}
                  size="small"
                >
                  <Download fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              borderRadius: 2,
              border: `1px solid ${darkMode ? "#333" : "#ddd"}`,
              background: darkMode ? "#181a20" : "#fafafa",
              p: 2,
              minHeight: 200,
              color: darkMode ? "#fff" : "#222",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <>
                {/* Code Verdict always at the top */}
                {codeVerdictSection && (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      background: darkMode ? "#23272f" : "#f3f3f3",
                      border: `2px solid ${extractVerdict(codeVerdictSection.content) === "Good" ? "#6aefb2" : "#fc5c7d"}`,
                      position: "relative",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: extractVerdict(codeVerdictSection.content) === "Good" ? "#6aefb2" : "#fc5c7d",
                          flex: 1,
                        }}
                      >
                        🏷️ Code Verdict: {extractVerdict(codeVerdictSection.content)}
                      </Typography>
                      <Tooltip title="Copy section">
                        <span>
                          <IconButton
                            color="primary"
                            onClick={() => handleCopySection(codeVerdictSection.title, codeVerdictSection.content)}
                            size="small"
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    <Markdown rehypePlugins={[rehypeHighlight]}>
                      {codeVerdictSection.content}
                    </Markdown>
                  </Box>
                )}
                {/* All other sections as boxes with copy button */}
                {otherSections.map((section) => {
                  // Special handling for Recommended Fix code block
                  if (/^🛠️?\s*Recommended Fix/i.test(section.title)) {
                    // Extract code block for copy
                    const match = section.content.match(/```(\w+)?\n([\s\S]*?)```/);
                    const codeBlock = match ? match[2].trim() : "";
                    return (
                      <Box
                        key={section.title}
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          background: darkMode ? "#23272f" : "#f3f3f3",
                          border: `1.5px solid ${darkMode ? "#6a82fb" : "#fc5c7d"}`,
                          position: "relative",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: darkMode ? "#6a82fb" : "#fc5c7d",
                              flex: 1,
                            }}
                          >
                            🛠️ Recommended Fix
                          </Typography>
                          <Tooltip title="Copy code">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleCopyRecommendedFixCode(section.content)}
                                size="small"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                        <Markdown rehypePlugins={[rehypeHighlight]}>
                          {section.content}
                        </Markdown>
                      </Box>
                    );
                  }
                  // All other sections
                  return (
                    <Box
                      key={section.title}
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        background: darkMode ? "#23272f" : "#f3f3f3",
                        border: `1.5px solid ${darkMode ? "#888" : "#bbb"}`,
                        position: "relative",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: darkMode ? "#fff" : "#222",
                            flex: 1,
                          }}
                        >
                          {section.title}
                        </Typography>
                        <Tooltip title="Copy section">
                          <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleCopySection(section.title, section.content)}
                              size="small"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                      <Markdown rehypePlugins={[rehypeHighlight]}>
                        {section.content}
                      </Markdown>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>
        </Paper>
      </Box>
      <Box sx={{ textAlign: "center", py: 2, color: "#888", fontSize: 14 }}>
        &copy; {new Date().getFullYear()} AI Code Reviewer &mdash; Made with ❤️ by Lokesh Shimpi
      </Box>
    </Box>
  );
}

export default App;