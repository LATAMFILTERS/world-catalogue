-- 100_graph_relationships.sql

-- TECHNOLOGY -> PROTECTS -> SYSTEM

INSERT INTO graph_relationship_types
(code,name)
VALUES
('PROTECTS','Protects')
ON CONFLICT (code) DO NOTHING;

-- MACROCORE

INSERT INTO knowledge_edges
(source_node_id,relationship_type_id,target_node_id,confidence_score)

SELECT
t.id,
r.id,
s.id,
100

FROM knowledge_nodes t,
     knowledge_nodes s,
     graph_relationship_types r

WHERE
t.code='MACROCORE'
AND
s.code='AIR_INTAKE'
AND
r.code='PROTECTS';

-- SYNTEPORE

INSERT INTO knowledge_edges
(source_node_id,relationship_type_id,target_node_id,confidence_score)

SELECT
t.id,
r.id,
s.id,
100

FROM knowledge_nodes t,
     knowledge_nodes s,
     graph_relationship_types r

WHERE
t.code='SYNTEPORE'
AND
s.code='FUEL_CLEANLINESS'
AND
r.code='PROTECTS';

-- SYNTRAX

INSERT INTO knowledge_edges
(source_node_id,relationship_type_id,target_node_id,confidence_score)

SELECT
t.id,
r.id,
s.id,
100

FROM knowledge_nodes t,
     knowledge_nodes s,
     graph_relationship_types r

WHERE
t.code='SYNTRAX'
AND
s.code='LUBRICATION'
AND
r.code='PROTECTS';

-- NANOFORCE

INSERT INTO knowledge_edges
(source_node_id,relationship_type_id,target_node_id,confidence_score)

SELECT
t.id,
r.id,
s.id,
100

FROM knowledge_nodes t,
     knowledge_nodes s,
     graph_relationship_types r

WHERE
t.code='NANOFORCE'
AND
s.code='HYDRAULIC'
AND
r.code='PROTECTS';

-- THERMACORE

INSERT INTO knowledge_edges
(source_node_id,relationship_type_id,target_node_id,confidence_score)

SELECT
t.id,
r.id,
s.id,
100

FROM knowledge_nodes t,
     knowledge_nodes s,
     graph_relationship_types r

WHERE
t.code='THERMACORE'
AND
s.code='COOLING'
AND
r.code='PROTECTS';
