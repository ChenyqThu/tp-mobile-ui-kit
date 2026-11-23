import React, { useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPTag } from '../../core/components/TPTag';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaTopologyNode {
  id: string;
  role: 'wan' | 'gateway' | 'ap' | 'client';
  name: string;
  modelOrDetail: string;
  ip: string;
  linkLabel: string;
  status: 'online' | 'warning';
}

export const DEFAULT_TOPOLOGY_NODES: readonly OmadaTopologyNode[] = [
  {
    id: 'topo-gw',
    role: 'gateway',
    name: 'ER7212PC (Gateway)',
    modelOrDetail: '8C-86-DD-A6-A7-5F • WAN3 Up',
    ip: '192.168.0.1',
    linkLabel: '1000M',
    status: 'online',
  },
  {
    id: 'topo-ap1',
    role: 'ap',
    name: 'EAP723 (3C-78-95-F0-45-F1)',
    modelOrDetail: 'LAN5 PoE 12.4W • 3 Clients',
    ip: '192.168.0.2',
    linkLabel: '2.5G PoE+',
    status: 'online',
  },
  {
    id: 'topo-ap2',
    role: 'ap',
    name: 'EAP723 (3C-78-95-F0-46-0C)',
    modelOrDetail: 'LAN6 PoE 11.8W • 1 Client',
    ip: '192.168.0.3',
    linkLabel: '2.5G PoE+',
    status: 'online',
  },
];

export interface OmadaTopologyBlockProps {
  siteName?: string;
  nodes?: readonly OmadaTopologyNode[];
  showHeader?: boolean;
  onBack?: () => void;
  onSelectNode?: (node: OmadaTopologyNode) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Interactive Omada v5.3+ network topology diagram (`SMBNET-4433`) showing Internet WAN uplink,
 * Gateway root, downlink Access Points, link rates, and loop-detection status.
 */
export const OmadaTopologyBlock: React.FC<OmadaTopologyBlockProps> = ({
  siteName = '92',
  nodes = DEFAULT_TOPOLOGY_NODES,
  showHeader = false,
  onBack,
  onSelectNode,
  className = '',
  style,
}) => {
  const [selectedId, setSelectedId] = useState<string>(nodes[0]?.id ?? 'topo-gw');
  const activeNode = nodes.find((n) => n.id === selectedId) ?? nodes[0];
  const gateway = nodes.find((n) => n.role === 'gateway') ?? nodes[0];
  const downlinks = nodes.filter((n) => n.id !== gateway?.id);

  const handleSelect = (node: OmadaTopologyNode) => {
    setSelectedId(node.id);
    onSelectNode?.(node);
  };

  return (
    <div
      className={showHeader ? `tp-omada-screen ${className}`.trim() : className}
      data-testid="omada-topology-block"
      style={style}
    >
      {showHeader && (
        <div className="tp-omada-header-wrap">
          <TPHeader
            variant="floating"
            title={`Site ${siteName} Topology`}
            subtitle="Loopback Detection: Active"
            left={
              onBack ? (
                <button
                  type="button"
                  className="tp-header-icon-btn"
                  aria-label="Back"
                  onClick={onBack}
                >
                  <TPIcon name="nav-back" size={20} />
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      <div className={showHeader ? 'tp-omada-scroll' : undefined}>
        <div className={showHeader ? 'tp-omada-body' : undefined}>
          <div className="tp-omada-topo-tree">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TPTag tone="success" size="sm">WAN3 Connected</TPTag>
              <TPTag tone="info" size="sm">Loop Protection On</TPTag>
            </div>

            {gateway && (
              <button
                type="button"
                className={`tp-omada-topo-node ${
                  activeNode?.id === gateway.id ? 'tp-omada-topo-node--active' : ''
                }`.trim()}
                onClick={() => handleSelect(gateway)}
              >
                <TPIcon name="client-switch" size={32} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{gateway.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)' }}>
                    {gateway.ip} • {gateway.modelOrDetail}
                  </div>
                </div>
                <span className="tp-omada-status-line tp-omada-status-line--good">
                  {gateway.linkLabel}
                </span>
              </button>
            )}

            <svg width="240" height="24" viewBox="0 0 240 24" aria-hidden="true">
              <path
                d="M120 0 V10 M46 10 H194 M46 10 V24 M194 10 V24"
                stroke="var(--tp-color-green)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {downlinks.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`tp-omada-topo-node ${
                  activeNode?.id === node.id ? 'tp-omada-topo-node--active' : ''
                }`.trim()}
                onClick={() => handleSelect(node)}
              >
                <TPIcon name="client-ap" size={30} color="#EBEBF0" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{node.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)' }}>
                    {node.ip} • {node.modelOrDetail}
                  </div>
                </div>
                <span className="tp-omada-status-line tp-omada-status-line--good">
                  {node.linkLabel}
                </span>
              </button>
            ))}

            {activeNode && (
              <div style={{ width: '100%', marginTop: 4 }}>
                <TPListCard divided>
                  <TPListItem title="Selected Node" value={activeNode.name} />
                  <TPListItem title="Uplink Negotiation" value={activeNode.linkLabel} />
                  <TPListItem title="Management IP" value={activeNode.ip} />
                </TPListCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
