import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { createDailyReport, fetchDailyReport, fetchProjects, updateDailyReport } from '../api/endpoints';
import type { Project } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { AppStackParamList } from '../navigation/AppNavigator';
import { extractError } from '../api/client';
import { stripRichText } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList, 'DailyReportForm'>;
type Route = RouteProp<AppStackParamList, 'DailyReportForm'>;

export function DailyReportFormScreen() {
  const nav = useNavigation<Nav>();
  const { id } = useRoute<Route>().params ?? {};
  const isEdit = !!id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accomplished, setAccomplished] = useState('');
  const [plans, setPlans] = useState('');
  const [blockers, setBlockers] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    (async () => {
      const ps = await fetchProjects();
      setProjects(ps);
      if (isEdit) {
        try {
          const r = await fetchDailyReport(id!);
          setProjectId(r.project?.id ?? ps[0]?.id ?? null);
          setReportDate(r.report_date);
          // Historical entries may contain HTML (TinyMCE output from the
          // web dashboard) or mixed Markdown — convert to plain text so the
          // user sees something editable instead of raw tags.
          setAccomplished(stripRichText(r.accomplished));
          setPlans(stripRichText(r.plans));
          setBlockers(stripRichText(r.blockers));
        } finally {
          setLoading(false);
        }
      } else {
        setProjectId(ps[0]?.id ?? null);
      }
    })();
  }, [id, isEdit]);

  const onSave = async (status: 'draft' | 'submitted') => {
    if (!projectId) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateDailyReport(id!, { accomplished, plans, blockers, status } as any);
      } else {
        await createDailyReport({
          project_id: projectId,
          report_date: reportDate,
          accomplished,
          plans,
          blockers,
          status,
        });
      }
      nav.goBack();
    } catch (e) {
      Alert.alert('Could not save', extractError(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Screen scroll={false}><Loading /></Screen>;

  return (
    <Screen>
      <Pressable onPress={() => nav.goBack()} style={{ marginTop: spacing.sm }}>
        <Text variant="small" color={colors.accent}>
          ← Back
        </Text>
      </Pressable>

      <Text variant="h1" style={{ marginTop: spacing.lg }}>
        {isEdit ? 'Edit entry' : "Today's check-in"}
      </Text>
      <Text variant="body" muted style={{ marginTop: spacing.xs }}>
        Short, honest, specific.
      </Text>

      {!isEdit && (
        <>
          <Text variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
            Project
          </Text>
          <View style={styles.chipRow}>
            {projects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                style={[
                  styles.chip,
                  projectId === p.id && { backgroundColor: colors.accent + '1f', borderColor: colors.accent },
                ]}
              >
                <Text variant="smallMedium" color={projectId === p.id ? colors.text : colors.textSecondary}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          label="Accomplished"
          value={accomplished}
          onChangeText={setAccomplished}
          placeholder="What you finished…"
          multiline
          rows={4}
        />
        <TextField
          label="Plans"
          value={plans}
          onChangeText={setPlans}
          placeholder="What's next…"
          multiline
          rows={4}
        />
        <TextField
          label="Blockers"
          value={blockers}
          onChangeText={setBlockers}
          placeholder="Anything in your way?"
          multiline
          rows={3}
        />
      </View>

      <View style={styles.actionRow}>
        <Button label="Save draft" onPress={() => onSave('draft')} variant="secondary" loading={saving} fullWidth />
      </View>
      <Button
        label="Submit"
        onPress={() => onSave('submitted')}
        loading={saving}
        size="lg"
        fullWidth
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionRow: { marginTop: spacing.xl },
});
