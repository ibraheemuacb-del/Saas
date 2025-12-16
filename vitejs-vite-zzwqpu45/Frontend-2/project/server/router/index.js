import express from 'express';
import complianceAgent from '../agents/compliance.js';
import enrichmentAgent from '../agents/enrichment.js';
import { supabaseServer } from '../supabase/client.js'; // ✅ use service role client

const router = express.Router();

/**
 * === Knowledge Base Upload ===
 */
router.post('/upload-doc', async (req, res) => {
  try {
    const { description, files } = req.body;

    console.log('Knowledge Base Upload:', { description, files });

    const { error } = await supabaseServer
      .from('knowledge_base')
      .insert([{ description, files }]);

    if (error) throw error;

    res.status(200).send({ message: 'Document uploaded to Knowledge Base' });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).send({ message: 'Failed to upload document' });
  }
});

/**
 * === Offer Draft ===
 */
router.post('/offer-draft', async (req, res) => {
  const candidate = req.body;

  try {
    await complianceAgent(candidate);
    await enrichmentAgent(candidate);

    const compliancePassed = true; // placeholder

    const { error } = await supabaseServer
      .from('candidates')
      .update({ offer_status: compliancePassed ? 'passed' : 'failed' })
      .eq('id', candidate.id);

    if (error) throw error;

    res.status(200).send({
      message: compliancePassed
        ? 'Offer draft processed successfully'
        : 'Offer draft failed compliance',
    });
  } catch (error) {
    console.error('Error processing offer draft:', error);
    res.status(500).send({ message: 'Failed to process offer draft' });
  }
});

/**
 * === Reference Check ===
 */
router.post('/reference-check', async (req, res) => {
  const { candidate, interviewScore, rating } = req.body;

  try {
    const SCORE_THRESHOLD = 70;
    const triggerByScore =
      typeof interviewScore === 'number' && interviewScore >= SCORE_THRESHOLD;
    const triggerByRating =
      typeof rating === 'string' && rating.toLowerCase() === 'recommended';

    const referencePassed = triggerByScore || triggerByRating;

    await supabaseServer
      .from('candidates')
      .update({ reference_status: referencePassed ? 'passed' : 'failed' })
      .eq('id', candidate.id);

    if (!referencePassed) {
      return res.status(200).send({
        message: 'Reference check failed, candidate rejected',
        referencePassed: false,
      });
    }

    await complianceAgent(candidate);
    await enrichmentAgent(candidate);

    const compliancePassed = true; // placeholder

    await supabaseServer
      .from('candidates')
      .update({ offer_status: compliancePassed ? 'passed' : 'failed' })
      .eq('id', candidate.id);

    let onboarded = false;
    if (compliancePassed) {
      console.log('Auto onboarding triggered for:', candidate);
      onboarded = true;
      await supabaseServer
        .from('candidates')
        .update({ onboarding_status: 'completed' })
        .eq('id', candidate.id);
    }

    res.status(200).send({
      message: onboarded
        ? 'Reference check passed → offer draft completed → onboarding triggered'
        : 'Reference check passed → offer draft completed → onboarding blocked',
      referencePassed: true,
      compliancePassed,
      onboarded,
    });
  } catch (error) {
    console.error('Error during reference check flow:', error);
    res.status(500).send({ message: 'Reference check failed' });
  }
});

/**
 * === Auto Onboarding ===
 */
router.post('/onboard', async (req, res) => {
  const candidate = req.body;

  try {
    console.log('Auto onboarding triggered for:', candidate);

    const { error } = await supabaseServer
      .from('candidates')
      .update({ onboarding_status: 'completed' })
      .eq('id', candidate.id);

    if (error) throw error;

    res.status(200).send({ message: 'Candidate onboarded successfully' });
  } catch (error) {
    console.error('Error during onboarding:', error);
    res.status(500).send({ message: 'Onboarding failed' });
  }
});

export default router;
