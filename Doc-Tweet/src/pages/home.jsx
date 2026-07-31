import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://doc-tweet-backend.onrender.com";

// home page component
function Home() {
  const [tab, setTab] = useState("all");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [ansLoading, setAnsLoading] = useState(false);

  // get token from localStorage since AuthContext doesnt expose it
  var token = localStorage.getItem("token") || localStorage.getItem("doctweet_token") || "";

  // fetch the feed
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/api/getposts`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }),
      fetch(`${API_BASE}/api/getquestions`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }),
    ])
      .then(async ([postsRes, questionsRes]) => {
        if (!postsRes.ok || !questionsRes.ok) {
          throw new Error("Something went wrong");
        }

        const [postsData, questionsData] = await Promise.all([
          postsRes.json(),
          questionsRes.json(),
        ]);

        const posts = (postsData || []).map((item) => ({ ...item, type: "post" }));
        const questions = (questionsData || []).map((item) => ({ ...item, type: "question" }));

        const merged = [...posts, ...questions].sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime();
          const bDate = new Date(b.created_at || 0).getTime();
          return bDate - aDate;
        });

        const filtered =
          tab === "posts"
            ? merged.filter((item) => item.type === "post")
            : tab === "questions"
            ? merged.filter((item) => item.type === "question")
            : merged;

        setFeed(filtered);
        setLoading(false);
        setErr("");
        setPage(1);
      })
      .catch((e) => {
        console.log(e);
        setErr("Failed to load feed");
        setLoading(false);
      });
  }, [tab, token]);

  // load more posts
  function loadMore() {
    setLoading(false);
  }

  // open question details
  function openQuestion(qid) {
    setSelectedQuestion(qid);
    setAnsLoading(false);
    setAnswers([]);
  }

  function closeModal() {
    setSelectedQuestion(null);
    setAnswers([]);
  }

  // format date
  function timeAgo(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    var now = new Date();
    var sec = (now - d) / 1000;
    if (sec < 60) return "now";
    if (sec < 3600) return Math.floor(sec / 60) + "m";
    if (sec < 86400) return Math.floor(sec / 3600) + "h";
    if (sec < 604800) return Math.floor(sec / 86400) + "d";
    return d.toLocaleDateString();
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        minHeight: "100vh",
        borderLeft: "1px solid #e1e8ed",
        borderRight: "1px solid #e1e8ed",
      }}
    >
      {/* header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #e1e8ed",
          padding: "16px 20px",
          zIndex: 100,
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
          Home
        </h1>
        <div style={{ display: "flex" }}>
          {["all", "posts", "questions"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                cursor: "pointer",
                fontWeight: 600,
                color: tab === t ? "#0f1419" : "#536471",
                borderBottom:
                  tab === t ? "2px solid #1d9bf0" : "2px solid transparent",
                background: "none",
                border: "none",
                fontSize: "15px",
              }}
            >
              {t === "all" ? "All" : t === "posts" ? "Posts" : "Questions"}
            </button>
          ))}
        </div>
      </div>

      {/* feed */}
      <div>
        {loading && feed.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#536471" }}
          >
            Loading...
          </div>
        )}

        {err && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "red" }}
          >
            {err}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "10px", color: "#1d9bf0" }}
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && feed.length === 0 && !err && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#536471" }}
          >
            Nothing here yet
          </div>
        )}

        {feed.map((item, idx) => {
          if (item.type === "post") {
            var author = item.author || {};
            var initial = (author.username || "U").charAt(0).toUpperCase();
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #e1e8ed",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#1d9bf0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {author.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#0f1419" }}>
                        {author.full_name || author.username || "Unknown"}
                      </span>
                      {author.is_verified && (
                        <span style={{ color: "#1d9bf0" }}>&#10003;</span>
                      )}
                      {author.is_doctor && (
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: "#1d9bf0",
                            color: "white",
                          }}
                        >
                          Doctor
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#536471", fontSize: "15px" }}>
                      @{author.username || "unknown"} ·{" "}
                      {timeAgo(item.created_at)}
                    </div>
                    {author.specialization && (
                      <div style={{ fontSize: "13px", color: "#536471" }}>
                        {author.specialization}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#536471",
                        marginBottom: "4px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Post
                    </div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#0f1419",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.content}
                    </div>
                    {item.image_url && (
                      <div
                        style={{
                          marginTop: "12px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid #e1e8ed",
                        }}
                      >
                        <img
                          src={item.image_url}
                          style={{ width: "100%", display: "block" }}
                          alt=""
                        />
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        marginTop: "12px",
                        color: "#536471",
                        fontSize: "14px",
                      }}
                    >
                      <span>&#9829; {item.likes_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            // question
            var q = item;
            var qAuthor = q.author;
            var isAnon = q.is_anonymous;
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #e1e8ed",
                  padding: "16px 20px",
                  cursor: "pointer",
                }}
                onClick={() => openQuestion(q.id)}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  {isAnon ? (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#536471",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      ?
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#1d9bf0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      {qAuthor && qAuthor.avatar_url ? (
                        <img
                          src={qAuthor.avatar_url}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          alt=""
                        />
                      ) : (
                        (
                          qAuthor && qAuthor.username
                            ? qAuthor.username
                            : "U"
                        )
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {isAnon ? (
                        <>
                          <span style={{ fontWeight: 700, color: "#0f1419" }}>
                            Anonymous
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: "#536471",
                              color: "white",
                            }}
                          >
                            Anonymous
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontWeight: 700, color: "#0f1419" }}>
                            {qAuthor && qAuthor.full_name
                              ? qAuthor.full_name
                              : qAuthor && qAuthor.username
                              ? qAuthor.username
                              : "Unknown"}
                          </span>
                          {qAuthor && qAuthor.is_verified && (
                            <span style={{ color: "#1d9bf0" }}>&#10003;</span>
                          )}
                        </>
                      )}
                      {q.is_resolved && (
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: "#00ba7c",
                            color: "white",
                          }}
                        >
                          Resolved
                        </span>
                      )}
                    </div>
                    {!isAnon && qAuthor && (
                      <div style={{ color: "#536471", fontSize: "15px" }}>
                        @{qAuthor.username || "unknown"} ·{" "}
                        {timeAgo(q.created_at)}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#536471",
                        marginBottom: "4px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Question
                    </div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {q.title}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#0f1419",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {q.content}
                    </div>

                    {/* preview answers */}
                    {q.top_answers && q.top_answers.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          background: "#f7f9fa",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                      >
                        {q.top_answers.map((ans) => (
                          <div
                            key={ans.id}
                            style={{
                              padding: "8px 0",
                              borderBottom: "1px solid #e1e8ed",
                              fontSize: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginBottom: "4px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "13px",
                                }}
                              >
                                {ans.author && ans.author.username
                                  ? ans.author.username
                                  : "Unknown"}
                              </span>
                              {ans.is_doctor_answer && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    background: "#1d9bf0",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  Doctor
                                </span>
                              )}
                            </div>
                            <div>{ans.content}</div>
                          </div>
                        ))}
                        <span
                          style={{
                            color: "#1d9bf0",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginTop: "8px",
                            display: "inline-block",
                          }}
                        >
                          View all {q.answer_count} answers
                        </span>
                      </div>
                    )}

                    {(!q.top_answers || q.top_answers.length === 0) && (
                      <div style={{ marginTop: "12px" }}>
                        <span
                          style={{
                            color: "#1d9bf0",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          Be the first to answer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}

        {feed.length > 0 && !loading && (
          <button
            onClick={loadMore}
            style={{
              width: "100%",
              padding: "16px",
              background: "none",
              border: "none",
              color: "#1d9bf0",
              fontWeight: 600,
              cursor: "pointer",
              borderBottom: "1px solid #e1e8ed",
            }}
          >
            Load more
          </button>
        )}
      </div>

      {/* answers modal */}
      {selectedQuestion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              borderRadius: "20px 20px 0 0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e1e8ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "white",
              }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800 }}>Answers</h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#536471",
                }}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                overflowY: "auto",
                padding: "0 20px",
                flex: 1,
              }}
            >
              {ansLoading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#536471",
                  }}
                >
                  Loading answers...
                </div>
              )}

              {!ansLoading && answers.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#536471",
                  }}
                >
                  No answers yet
                </div>
              )}

              {answers.map((ans, i) => {
                var a = ans.author || {};
                var init = (a.username || "U").charAt(0).toUpperCase();
                return (
                  <div
                    key={i}
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #e1e8ed",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#1d9bf0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        {a.avatar_url ? (
                          <img
                            src={a.avatar_url}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            alt=""
                          />
                        ) : (
                          init
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>
                          {a.full_name || a.username || "Unknown"}
                          {a.is_verified && (
                            <span
                              style={{ color: "#1d9bf0", fontSize: "14px" }}
                            >
                              {" "}
                              &#10003;
                            </span>
                          )}
                          {ans.is_doctor_answer && (
                            <span
                              style={{
                                fontSize: "11px",
                                background: "#1d9bf0",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontWeight: 700,
                                marginLeft: "6px",
                              }}
                            >
                              Doctor
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "13px", color: "#536471" }}>
                          @{a.username || "unknown"} ·{" "}
                          {timeAgo(ans.created_at)}
                        </div>
                        {a.specialization && (
                          <div
                            style={{ fontSize: "12px", color: "#536471" }}
                          >
                            {a.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "15px", lineHeight: "1.5" }}>
                      {ans.content}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        color: "#536471",
                        fontSize: "14px",
                      }}
                    >
                      &#9829; {ans.likes_count || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;