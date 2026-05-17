import { MessageCircle } from "lucide-react";
import { CaseCommentForm } from "@/components/CaseCommentForm";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/format";

type CaseCommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    id: string;
    nickname: string;
    avatar: string;
  };
  replies?: CaseCommentItem[];
};

export function CaseComments({
  caseId,
  comments,
  commentCount
}: {
  caseId: string;
  comments: CaseCommentItem[];
  commentCount: number;
}) {
  return (
    <section className="mt-7 rounded-[18px] border border-[#E8E8ED] bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#FF3D00]">댓글</p>
          <h2 className="mt-1 text-xl font-black text-neutral-950">{commentCount}개 의견</h2>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#FFF2EC] text-[#FF3D00]">
          <MessageCircle aria-hidden="true" size={21} />
        </span>
      </div>

      <CaseCommentForm
        caseId={caseId}
        label="댓글 작성"
        placeholder="사건에 대한 의견을 남겨주세요."
        submitLabel="댓글 등록"
        textareaId="case-comment"
      />

      <div className="mt-6 space-y-3">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-[16px] bg-neutral-50 p-4">
              <div className="flex items-center gap-3">
                <UserAvatar src={comment.user.avatar} alt={`${comment.user.nickname} 프로필`} size="sm" />
                <div>
                  <p className="text-sm font-black text-neutral-950">{comment.user.nickname}</p>
                  <p className="text-xs font-bold text-neutral-400">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-neutral-700">
                {comment.body}
              </p>

              {comment.replies?.length ? (
                <div className="mt-4 space-y-3 border-l-2 border-[#FFD6C8] pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-[14px] bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={reply.user.avatar} alt={`${reply.user.nickname} 프로필`} size="sm" />
                        <div>
                          <p className="text-sm font-black text-neutral-950">{reply.user.nickname}</p>
                          <p className="text-xs font-bold text-neutral-400">{formatDate(reply.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-neutral-700">
                        {reply.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <details className="group mt-4">
                <summary className="inline-flex min-h-9 cursor-pointer list-none items-center justify-center rounded-full bg-white px-4 text-xs font-black text-[#FF3D00] shadow-sm transition active:scale-[0.98] [&::-webkit-details-marker]:hidden">
                  답글 달기
                </summary>
                <CaseCommentForm
                  caseId={caseId}
                  label="답글 작성"
                  parentId={comment.id}
                  placeholder={`${comment.user.nickname}님에게 답글 남기기`}
                  submitLabel="답글 등록"
                  textareaId={`reply-${comment.id}`}
                  variant="reply"
                />
              </details>
            </article>
          ))
        ) : (
          <div className="rounded-[16px] bg-neutral-50 px-4 py-6 text-center">
            <p className="text-base font-black text-neutral-950">아직 댓글이 없어요</p>
            <p className="mt-1 text-sm font-bold text-neutral-500">첫 의견을 남겨보세요.</p>
          </div>
        )}
      </div>
    </section>
  );
}
