'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Lock, Loader2, Trash2, Save, Eye, EyeOff, Crown, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export function ContaClient() {
  const { data: session, update: updateSession } = useSession() || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountInfo, setAccountInfo] = useState<{
    isPremium: boolean;
    premiumExpiresAt: string | null;
    createdAt: string;
    bookCount: number;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session]);

  useEffect(() => {
    fetch('/api/account')
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setAccountInfo(d);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (name.trim() !== (session?.user?.name ?? '')) body.name = name.trim();
      if (email.trim().toLowerCase() !== (session?.user?.email ?? '').toLowerCase()) body.email = email.trim();
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        toast.info('Nenhuma alteração para salvar.');
        return;
      }
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao salvar.');
      toast.success('Dados atualizados com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Refresh session
      await updateSession?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePassword) {
      toast.error('Digite sua senha para confirmar.');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao excluir.');
      toast.success('Conta excluída. Redirecionando...');
      setTimeout(() => signOut({ callbackUrl: '/login' }), 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir conta.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
    } catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-violet-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">
            <ArrowLeft size={17} /> Voltar
          </Link>
          <h1 className="font-display text-base font-bold text-stone-800">Minha Conta</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-8 space-y-6">
        {/* Account overview */}
        {accountInfo && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 font-display text-2xl font-bold text-violet-700">
                {name?.[0]?.toUpperCase() ?? 'A'}
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-stone-800">{name || 'Autor'}</h2>
                <p className="text-sm text-stone-500">{email}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-stone-50 p-3 text-center">
                <p className="text-xs font-semibold text-stone-500">Plano</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-stone-800">
                  {accountInfo.isPremium ? <><Crown size={14} className="text-amber-500" /> Premium</> : 'Gratuito'}
                </p>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 text-center">
                <p className="text-xs font-semibold text-stone-500">Livros</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-stone-800">
                  <BookOpen size={14} className="text-violet-500" /> {accountInfo.bookCount}
                </p>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 text-center">
                <p className="text-xs font-semibold text-stone-500">Membro desde</p>
                <p className="mt-1 text-sm font-bold text-stone-800">{formatDate(accountInfo.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit profile */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-stone-800">
            <User size={18} className="text-violet-600" /> Dados pessoais
          </h3>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500">Nome</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <User size={16} className="text-stone-400" />
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none" placeholder="Seu nome" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">E-mail</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <Mail size={16} className="text-stone-400" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="flex-1 bg-transparent text-sm outline-none" placeholder="seu@email.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-stone-800">
            <Lock size={18} className="text-violet-600" /> Alterar senha
          </h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500">Senha atual</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <Lock size={16} className="text-stone-400" />
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrentPw ? 'text' : 'password'}
                  className="flex-1 bg-transparent text-sm outline-none" placeholder="Senha atual" />
                <button onClick={() => setShowCurrentPw((v) => !v)} className="text-stone-400 hover:text-stone-600">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Nova senha</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <Lock size={16} className="text-stone-400" />
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPw ? 'text' : 'password'}
                  className="flex-1 bg-transparent text-sm outline-none" placeholder="Nova senha (mínimo 6 caracteres)" />
                <button onClick={() => setShowNewPw((v) => !v)} className="text-stone-400 hover:text-stone-600">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Confirmar nova senha</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <Lock size={16} className="text-stone-400" />
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showNewPw ? 'text' : 'password'}
                  className="flex-1 bg-transparent text-sm outline-none" placeholder="Confirmar nova senha" />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-50">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar alterações
        </button>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-red-700">
            <Trash2 size={18} /> Zona perigosa
          </h3>
          <p className="mt-2 text-sm text-red-600">
            Ao excluir sua conta, todos os seus livros, capítulos, personagens e dados serão permanentemente removidos. Esta ação não pode ser desfeita.
          </p>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
              Excluir minha conta
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">Digite sua senha para confirmar:</p>
              <input value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                type="password" className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400"
                placeholder="Sua senha" />
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Confirmar exclusão
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
