'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';
import { Champion, Role, RankTier, ROLES } from '@/lib/types';
import { getChampionIconUrl, getDDragonVersionAsync } from '@/lib/data-dragon';
import Header from '@/components/Header';
import RankSelector from '@/components/RankSelector';

// Role-to-tag mapping for filtering (approximate by Data Dragon tags)
const ROLE_TAG_MAP: Record<string, string[]> = {
  top: ['Fighter', 'Tank'],
  jungle: ['Fighter', 'Assassin', 'Tank'],
  mid: ['Mage', 'Assassin'],
  bottom: ['Marksman'],
  support: ['Support', 'Mage', 'Tank'],
};

const ROLE_INFO = Object.fromEntries(ROLES.map(r => [r.value, r]));

export default function HomePage() {
  const router = useRouter();
  const t = useT();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [primaryRoles, setPrimaryRoles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [selectedRank, setSelectedRank] = useState<RankTier>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [version, rolesRes] = await Promise.all([
          getDDragonVersionAsync(),
          fetch('/api/champion-roles'),
        ]);
        const [champRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`),
        ]);
        const [data, roles] = await Promise.all([champRes.json(), rolesRes.json()]);
        const champs: Champion[] = Object.values(data.data).map((c: any) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          image: c.image.full,
          tags: c.tags,
        }));
        setChampions(champs.sort((a, b) => a.name.localeCompare(b.name)));
        setPrimaryRoles(roles);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredChampions = useMemo(() => {
    return champions.filter(c => {
      const matchesSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());

      const matchesRole = selectedRole === 'all' ||
        c.tags.some(tag => ROLE_TAG_MAP[selectedRole]?.includes(tag));

      return matchesSearch && matchesRole;
    });
  }, [champions, search, selectedRole]);

  function handleChampionClick(champion: Champion) {
    const role = selectedRole === 'all'
      ? (primaryRoles[champion.id] as Role | undefined) ?? 'top'
      : selectedRole;
    router.push(`/matchup/${champion.id}?role=${role}&rank=${encodeURIComponent(selectedRank)}`);
  }

  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
        </section>

        {/* Search */}
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={t('home.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRole('all')}
          >
            {t('roles.all')}
          </button>
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`filter-btn ${selectedRole === r.value ? 'active' : ''}`}
              onClick={() => setSelectedRole(r.value)}
            >
              {r.icon} {t(`roles.${r.value}`)}
            </button>
          ))}
          <RankSelector value={selectedRank} onChange={setSelectedRank} />
        </div>

        {/* Champion Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="champion-grid">
            {filteredChampions.map(champion => {
              const primaryRole = primaryRoles[champion.id];
              const roleInfo = primaryRole ? ROLE_INFO[primaryRole] : null;
              return (
                <div
                  key={champion.id}
                  className="champion-card"
                  onClick={() => handleChampionClick(champion)}
                  title={champion.name}
                >
                  <img
                    src={getChampionIconUrl(champion.image)}
                    alt={champion.name}
                    loading="lazy"
                  />
                  <div className="champion-card-name">{champion.name}</div>
                  {selectedRole === 'all' && roleInfo && (
                    <div className="champion-card-role">{roleInfo.icon} {t(`roles.${roleInfo.value}`)}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredChampions.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <p className="empty-state-text">{t('home.noChampions')}</p>
          </div>
        )}
      </main>
    </>
  );
}
